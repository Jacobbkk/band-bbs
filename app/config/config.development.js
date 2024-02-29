module.exports = {
  appPort: 4000,
  secretKey: '암호화키',
  database: {
    host: 'localhost',
    username: 'root',
    password: 'asdf',
    port: 3306,
    database: 'bandee',
  },

  //CORS 설정
  cors: {
    origin: true,
    credentials: true,
  },
  jwt: {
    accessTokenExpire: '1m',
    refreshTokenExpire: '14d',
  },
};
