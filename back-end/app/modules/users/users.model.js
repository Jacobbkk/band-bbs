const usersModel = {};

usersModel.tableName = 'tbl_members';
/**
 * 사용자 데이타 한 행을 가져온다.
 */
usersModel.getUser = async (value, column = 'id') => {
  // 데이타베이스 연결 객체
  const db = database();

  // 반환할 객체
  let result = null;
 // console.log('getuser 시작');

  try {
    await db(usersModel.tableName)
      .select('*')
     // .select(db.raw('INET_ATON(`loged_ip`) AS `loged_ip2`'))
      .where(column, value)
      .limit(1)
      .then(rows => {
        if (rows && rows.length > 0) {
          result = rows[0];
        }
      });
  } catch (e) {
    console.log(e);
    result = null;
  }

  return result;
};

/**
 * 사용자 데이타 추가
 */
usersModel.addUser = async data => {
  // 혹시 빈값이 들어가있는경우 기본값 처리
  data.status = data?.status ?? 'Y';
  data.login_id = data?.login_id ?? '';
  data.login_pass = data?.login_pass ?? '';
  data.phone = data?.phone ?? '';
  data.nickname = data?.nickname ?? '';
  data.auth = data?.auth ?? 1;
  data.created_at = data?.created_at ?? new Date();
  data.updated_at = data?.updated_at ?? new Date();
  data.agree_marketing = data?.agree_marketing ?? 'N';
  data.privacy_agree_at = data?.privacy_agree_at ?? new Date();

  // 비밀번호는 암호화 처리한다.
  data.login_pass = require('sha256')(require('md5')(appConfig.secretKey + data.login_pass));

  // 결과값을 반환할 flag
  let result = false;

  // 데이타베이스 객체
  const db = database();

  try {
    console.log('데이타 넣기 시작');
    await db(usersModel.tableName)
      .insert(data)
      .then(() => {
        result = true;
      });
  } catch (err) {
    console.log(err);
    return err;
  }

  return result;
};

/**
 * 토큰을 생성합니다.
 */
usersModel.createToken = async (type, userInfo) => {
  const jwt = require('jsonwebtoken');
  const expiresIn = type === 'refresh' ? appConfig.jwt.refreshTokenExpire : appConfig.jwt.accessTokenExpire;

  return await jwt.sign(
    {
      id: userInfo.id,
    },
    appConfig.secretKey,
    {
      expiresIn,
    }
  );
};

/**
 * 반환용 토큰을 생성합니다.
 */
usersModel.responseToken = async userInfo => {
  let newAccessToken = '',
    newRefreshToken = '';
  await usersModel.createToken('access', userInfo).then(v => (newAccessToken = v));
  await usersModel.createToken('refresh', userInfo).then(v => (newRefreshToken = v));

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

module.exports = usersModel;
