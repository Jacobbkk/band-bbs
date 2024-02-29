const mdb = require('knex-mariadb');
// 추가. 1.28일

const knex = require('knex')({
  // client: 'mysql2',
  client: mdb,
  connection: {
    host: appConfig.database.host,
    user: appConfig.database.username,
    password: appConfig.database.password,
    port: appConfig.database.port,
    database: appConfig.database.database,
  },
  debug: false,
});

module.exports = knex;
