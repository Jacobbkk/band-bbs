const repl = require('repl');
const boardController = {};

/**
 * 게시판 정보를 가져옵니다.
 */
boardController.getBoardInfo = async (req, res) => {
  const boardKey = req.params?.boardKey ?? '';

  // 게시판 키가 올바르게 넘어왔는지 확인합니다.
  if (!boardKey) {
    return res.status(400).json({ error: '존재 하지 않거나 삭제된 게시판입니다.' });
  }

  // 게시판 모델 불러오기
  const boardModel = loadModule('board', 'model');

  // 게시판 정보 가져오기
  const boardInfo = await boardModel.getBoard(boardKey);

  // TS Error 2839 로 수정해준다. boardInfo === {}
  if (!boardInfo || boardInfo == {}) {
    return res.status(400).json({ error: '존재 하지 않거나 삭제된 게시판입니다.' });
  }

  return res.json({ result: boardInfo });
};

boardController.getPost = async (req, res) => {
  const postId = req.params?.postId;

  const boardModel = loadModule('board', 'model');
  const result = await boardModel.getPostOne(postId);

  if (result) {
    // 문자열 형태로 되어있는 attach_list는 JSON형태로 변환해준다.
    result.attach_list = JSON.parse(result.attach_list);
    result.is_notice = result.is_notice === 'Y';
  }

  return res.json({ result });
};

boardController.getPostList = async (req, res) => {
  const params = {};
  params.key = req.params?.boardKey ?? '';
  params.page = req.query?.page ?? 1;
  params.page_rows = req.query?.page_rows ?? 10;
  params.searchColumn = req.query?.searchColumn ?? '';
  params.searchQuery = req.query?.searchQuery ?? '';

  // 게시판 모델 불러오기
  const boardModel = loadModule('board', 'model');

  // 먼저 공지글 부터 불러온다
  params.isNotice = true;
  const noticeList = await boardModel.getPost(params);

  // 일반 게시글을 불러온다.
  params.isNotice = false;
  const list = await boardModel.getPost(params);

  // 반환할 객체를 반든다.
  const result = {
    result: [...noticeList.result, ...list.result], // 공지사항 목록과 일반게시글 목록을 합친다.
    totalCount: list.totalCount,
  };

  return res.json(result);
};

/**
 * 게시글 작성 / 수정 / 답글 처리
 */
boardController.writeBoardPost = async (req, res) => {
  const boardKey = req.params?.boardKey ?? '';
  let postId = req.params?.postId ?? 0;
  postId = postId * 1;
  const postParentId = req.body?.parent_id * 1 ?? 0;

  // 넘어온 데이타에 따라 수정인지 신규인지 답글인지 미리 정의해둔다
  const isEdit = postId > 0;
  const isReply = postId === 0 && postParentId > 0;

  // 저장할 데이타를 먼저 정리한다.
  const updateData = {};
  updateData.title = req.body?.title ?? '';
  updateData.content = req.body?.content ?? '';
  updateData.category = req.body?.category ?? '';
  updateData.author_name = req.body?.author_name ?? '';
  updateData.author_pass = req.body?.author_pass ?? '';
  updateData.is_notice = req.body?.is_notice === true ? 'Y' : 'N';
  updateData.updated_at = new Date();
  updateData.updated_user = req.loginUser.id;
  updateData.updated_ip = req.loginUser.ip;

  // 첨부파일 목록
  const attach_list = req.body?.attach_list ?? [];
  updateData.attach_list = JSON.stringify(attach_list);

  // 게시판 모델 불러오기
  const boardModel = loadModule('board', 'model');

  // 답글이거나, 수정일 경우 원본 글을 가져와야 한다.
  let refData = null;

  if (isEdit) {
    refData = await boardModel.getPostOne(postId);

    if (!refData) {
      return res.status(400).json({ error: '수정하려는 원본글이 존재하지 않거나 이미 삭제되었습니다.' });
    }
  } else if (isReply) {
    refData = await boardModel.getPostOne(postParentId);

    if (!refData) {
      return res.status(400).json({ error: '답글을 작성하려는 원본글이 존재하지 않거나 이미 삭제되었습니다.' });
    }
  }

  // 로그인된 사용자의 경우, 비밀번호와 작성자이름은 비워둔다.
  if (req.loginUser.id > 0) {
    updateData.author_name = '';
    updateData.author_pass = '';
  }
  // 비로그인 사용자의 경우, 이름과 비밀번호를 작성하였는지 체크한다.
  else {
    if (updateData.author_name.length === 0) {
      return res.status(400).json({ error: '닉네임을 입력하셔야 합니다.' });
    }
    if (updateData.author_pass.length === 0) {
      return res.status(400).json({ error: '비밀번호를 입력하셔야 합니다.' });
    }

    // 입력받은 비밀번호를 암호화 한다.
    updateData.author_pass = require('sha256')(require('md5')(appConfig.secretKey + updateData.author_pass));

    // 수정글인 경우 입력한 비밀번호와 기존 글의 비밀번호가 동일한지 확인한다.
    if (isEdit) {
      if (updateData.author_pass !== refData?.author_pass) {
        return res.status(400).json({ error: '수정하려는 글의 비밀번호가 맞지않습니다.' });
      }
    }
  }

  // 신규등록일 경우 필수 정보를 추가해준다.
  if (!isEdit) {
    updateData.board_key = boardKey;
    updateData.type = req.body?.type ?? 'POST'; // DEFAULT 로 'POST' 입력, 댓글일경우 명시해줘야함
    updateData.created_at = updateData.updated_at;
    updateData.created_user = updateData.updated_user;
    updateData.created_ip = updateData.updated_ip;

    if (isReply) {
      updateData.parent_id = postParentId;
    }
  }

  // 첨부된 파일중 이미지 파일이 있다면 썸네일로 지정함
  updateData.thumbnail = '';

  // 첨부파일 배열을 돌면서 검사 (원래 코드)
  // for (let i = 0; i < attach_list.length; i++) {
  //   if (attach_list[i].isImage) {
  //     // 해당 첨부파일이 이미지이면 첨부파일로 값을 넣고, for문 break;
  //     updateData.thumbnail = attach_list[i].file_url;
  //     break;
  //   }
  // }

  // 첨부파일 배열이 비어있지 않은 경우에만 루프 진행
  if (attach_list.length > 0) {
    // 첨부파일 배열을 돌면서 검사
    for (let i = 0; i < attach_list.length; i++) {
      if (attach_list[i].isImage) {
        // 해당 첨부파일이 이미지이면 썸네일로 값을 넣고, for문 break;
        updateData.thumbnail = String(attach_list[i].file_url);
        break;
      }
    }
  }

  updateData.attach_count = attach_list.length;

  // 데이타베이스 처리 객체
  const db = database();

  // 멀티뎁스 게시판을 위한 처리
  // 신규작성일때만 처리한다.
  if (!isEdit) {
    // 부모게시글이 없다면?
    if (!isReply) {
      updateData.reply = '';

      // num은 게시글의 가장 큰 num 값을 가져와 1을 더한다.
      updateData.num = 1;
      await db('tbl_board_posts')
        .max('num', { as: 'max' })
        .then(rows => {
          if (rows && rows[0]) {
            updateData.num = (rows[0]?.max ?? 0) + 1;
          }
        });
    } else {
      // num은 부모의 num을 그대로 따른다.
      updateData.num = refData.num;

      // reply를 계산하자. reply의 컬럼 길이가 10이므로 최대 10단계까지 답변가능
      if (refData.reply.length >= 10) {
        return res.status(400).json({ error: '더 이상 답변할 수 없습니다. 답변은 10단계 까지만 가능합니다.' });
      }

      const replyLen = refData.reply.length + 1;

      const begin_reply_char = 'A';
      const end_reply_char = 'Z';

      let replyChar = begin_reply_char;

      let query = `SELECT MAX(SUBSTRING(reply, ${replyLen}, 1)) AS reply FROM tbl_board_posts WHERE board_key = ? AND num = ? AND SUBSTRING(reply, ${replyLen}, 1) <> '' `;
      let bindList = [boardKey, refData.num];

      if (replyLen > 0) {
        query += ' AND reply LIKE ? ';
        bindList.push(refData.reply + '%');
      }

      await db.raw(query, bindList).then(rows => {
        if (rows && rows[0]) {
          if (rows[0].reply === end_reply_char) {
            return res.status(500).json({ error: '더 이상 답변할 수 없습니다. 답변은 26개까지만 가능합니다.' });
          } else if (rows[0].reply) {
            replyChar = String.fromCharCode(rows[0].reply.charCodeAt(0) + 1);
          }
        }
      });
    }
  }

  // 실제 DB 입력처리
  try {
    // Chat GPT hint
    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        // Convert BigInt values to strings
        if (typeof updateData[key] === 'bigint') {
          updateData[key] = String(updateData[key]);
        }
      }
    }
    if (isEdit) {
      await db('tbl_board_posts').where('id', postId).update(updateData);
    } else {
      await db('tbl_board_posts')
        .insert(updateData)
        .then(id => {
          postId = id;
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'DB 입력도중 오류가 발생하였습니다.' });
  }

  try {
    console.log('postid: ' + postId);
    return res.status(200).json({ result: { id: postId } });
  } catch (err) {
    console.log(err);
  }
};

/**
 * 게시판 조회수 처리하기
 */
boardController.increasePostHit = async (req, res) => {
  // 패러미터에서 값을 받습니다.
  const boardKey = req.params?.boardKey ?? '';
  const postId = (req.params?.postId ?? 0) * 1;

  console.log(boardKey, postId);
  if (!boardKey || postId < 0) {
    // 조회수를 올리는 작업의 경우 실패하여도 사용자에겐 보이지 않도록 silent 하게 처리해야하므로 오류일 경우에도 STATUS 200처리.
    return res.json({});
  }

  try {
    const db = database();
    await db.raw('UPDATE tbl_board_posts SET `hit` = `hit` + 1 WHERE id = ?', [postId]);
  } catch {}

  return res.json({});
};

/**
 * 게시글 삭제하기
 */
boardController.deletePost = async (req, res) => {
  // 패러미터에서 값을 받습니다.
  const boardKey = req.params?.boardKey ?? '';
  const postId = (req.params?.postId ?? 0) * 1;

  // 먼저 원본 게시글 데이타를 가져옵니다.
  const boardModel = loadModule('board', 'model');
  const original = boardModel.getPostOne(postId);

  // 원본글이 없거나 이미 삭제된 글의 경우 처리
  if (!original || original.status === 'N') {
    return res.status(400).json({ error: '존재하지 않거나 이미 삭제된 글입니다.' });
  }

  // 삭제 권한을 체크합니다.
  if (this.loginUser.auth < 10) {
    // 관리자 권한이 아닌경우
    if (original.created_user === 0 && this.loginUser.id === 0) {
      // 작성자도 비회원, 현재 사용자도 비회원일경우 비밀번호 체크
      const password = req.body?.password ?? '';
      const encryptedPassword = require('sha256')(require('md5')(appConfig.secretKey + password));

      // 비밀번호가 다를경우
      if (encryptedPassword !== original.author_pass) {
        return res.status(400).json({ error: '해당 글을 삭제할 권한이 없습니다.' });
      }
    } else if (original.created_user !== this.loginUser.id) {
      // 작성자와 현재 로그인 회원이 다른경우
      return res.status(400).json({ error: '해당 글을 삭제할 권한이 없습니다.' });
    }
  }

  // STATUS를 N 처리해준다.
  try {
    const db = database();
    await db(boardModel.postTableName)
      .where('id', postId)
      .update({
        status: 'N',
        updated_at: new Date(),
        updated_user: this.loginUser.id,
        updated_ip: this.loginUser.ip``,
      });
  } catch {
    return res.status(500).json({ error: 'DB 에러' });
  }

  return res.json({});
};

module.exports = boardController;
