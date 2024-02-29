const boardModel = {};

boardModel.tableName = 'tbl_board';
boardModel.postTableName = 'tbl_board_posts';

/**
 * 게시판 키를 이용하여 게시판 정보를 가져옵니다.
 */
boardModel.getBoard = async key => {
  // 반환할 객체 선언
  let result = {};

  const db = database();
  try {
    await db(boardModel.tableName)
      .where('key', key)
      .limit(1)
      .then(rows => {
        if (rows.length > 0 && rows[0]) {
          result = rows[0];
        }
      });
  } catch {
    result = {};
  }

  return result;
};

/**
 * 게시글 또는 댓글 목록 불러오기
 */
boardModel.getPost = async params => {
  // 게시판 고유 키
  const boardKey = params?.key ?? '';

  // 게시글인지, 댓글인지 여부
  const type = params?.type ?? 'POST';
  const parent_id = params?.parent_id ?? 0; // 댓글일 경우 부모 게시글 PK

  // 검색 조건
  const isNotice = params?.isNotice ? 'Y' : 'N';
  const searchColumn = params?.searchColumn ?? '';
  const searchQuery = params?.searchQuery ?? '';
  const page = params?.page ?? 1;
  const pageRows = params?.page_rows ?? 10;
  const start = (page - 1) * pageRows;

  const db = database();
  const t = db(boardModel.postTableName)
    .select(db.raw(`SQL_CALC_FOUND_ROWS ${boardModel.postTableName}.*`))
    .select('tbl_members.nickname AS created_user_name')
    .leftJoin('tbl_members', `${boardModel.postTableName}.created_user`, 'tbl_members.id')
    .where(`${boardModel.postTableName}.status`, 'Y')
    .where(`${boardModel.postTableName}.type`, type)
    .where(`${boardModel.postTableName}.is_notice`, isNotice);

  // 게시판 키가 있는 경우 조건에 추가한다.
  if (boardKey) {
    t.where(`${boardModel.postTableName}.board_key`, boardKey);
  }

  // 댓글 불러오기의 경우 부모 게시글 PK를 조건에 추가한다.
  if (type === 'COMMENT') {
    t.where(`${boardModel.postTableName}.parent_id`, parent_id);
  }

  // 공지글 불러오기가 아니면서, 검색어 값이 있는 경우
  if (isNotice !== 'Y' && searchColumn && searchQuery) {
    if (searchColumn === 'title') {
      t.whereLike(`${boardModel.postTableName}.title`, searchQuery);
    } else if (searchColumn === 'author') {
      t.where('tbl_members.nickname', searchQuery);
    } else if (searchColumn === 'title+content') {
      t.where(function () {
        this.where(`${boardModel.postTableName}.title`, searchQuery).orWhere(`${boardModel.postTableName}.content`, searchQuery);
      });
    }
  }

  // 공지가 아닐 경우 페이징 처리
  if (isNotice !== 'Y') {
    t.limit(pageRows).offset(start);
  }

  // 반환할 객체 만들기
  const result = {
    result: [],
    totalCount: 0,
  };

  // 정렬 순서 설정
  t.orderBy('num', 'desc').orderBy('reply', 'asc');

  // 리스트 불러오기 
  // console.log(t.toSQL());
  // await t.then((rows) => {
  //     result.result = rows;
    // })

  // Chat GPT hint  
  result.result = await t;

  // 검색된 총 게시글수 불러오기
  await db.raw('SELECT FOUND_ROWS() AS `cnt`').then(res => {
    //  result.totalCount = res[0][0]?.cnt * 1 ?? 0
    result.totalCount = Number(res[0][0]?.cnt) || 0;
  });

  // 각 게시글의 번호를 달아준다.
  for (let i = 0; i < result.result.length; i++) {
    result.result[i].num = result.totalCount - start - i;
  }

  return result;
};

/**
 * 게시글 한개 가져오기
 */
boardModel.getPostOne = async postId => {
  let result = {};

  const db = database();
  await db
    .select(db.raw(`${boardModel.postTableName}.*`))
    .select(db.raw(`IFNULL(tbl_members.nickname, ${boardModel.postTableName}.author_name)  AS created_user_name`))
    .from(boardModel.postTableName)
    .leftJoin('tbl_members', `${boardModel.postTableName}.created_user`, 'tbl_members.id')
    .where(boardModel.postTableName + '.id', postId)
    .then(rows => {
      if (rows && rows[0]) {
        result = rows[0];
      }
    });

  return result;
};

module.exports = boardModel;
