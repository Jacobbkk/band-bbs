const App = {
  express: null,
  idDev: false,
  config: {},
};

//의존성 패키지
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const cookieParser = require('cookie-parser');

process.env.TZ = 'Asia/Seoul';

App.express = express();

// 방금 작성한 global.js 파일을 로드합니다.
require('./global');

// CookieParser, bodyParser 를 로드합니다.
// 여기서 appConfig 변수는 global.js 파일에서 각 환경에 맞는 config파일을 로드하여 할당된 변수입니다.
App.express.use(cookieParser(appConfig.secretKey));
App.express.use(bodyParser.json());
App.express.use(bodyParser.urlencoded({ extended: true }));
App.express.use(cors(appConfig.cors));

/**
 * Helper에 등록된 helper들 자동으로 불러오기
 */
// helpers 폴더의 파일 목록을 가져옵니다.
let fileList = fs.readdirSync(root + '/helpers');
// 파일들을 전부 로드합니다.
fileList.forEach(async fileName => {
  require(root + '/helpers/' + fileName);
});

/**
 * 전역 Middleware
 * ------------------------------------------------------------------------------------
 * 사용자 로그인 여부 체크
 */
const userController = loadModule('users', 'controller');
App.express.use(userController.loginUserCheck);

/**
 * 모듈에 등록된 Router 들 자동으로 불러오기
 */
// 라우터 라이브러리를 로드하고 router 객체에 할당 해줍니다.
const router = require('express').Router();

// modules 폴더에 등록된 디렉토리 목록을 불러옵니다.
let dirList = fs.readdirSync(modulePath);
dirList.forEach(dir => {
  // 디렉토리가 맞을경우
  if (fs.lstatSync(modulePath + '/' + dir).isDirectory()) {
    // 라우팅 설정파일이 존재할 경우
    const routePath = `${modulePath}/${dir}/${dir}.routes.js`;
    const matchPath = `/${dir}`;

    // 파일이 존재한다면 router.use로 해당 라우트를 등록해준다.

    if (fs.existsSync(routePath)) {
      router.use(matchPath, require(routePath));
    }
  }
});

// App.express 객체에 위에 불러온 router 설정을 사용 설정해줍니다.
App.express.use(router);

/**
 * 업로드 관련 Router 추가
 */
const attachLibrary = require(root + '/libraries/attach.library');
const path = require('path');
App.express.use(attachLibrary);

// REST API URL 중 /attaches 로 접근하는 리소스는 모두 그대로 리소스를 반환해줍니다.
// 정적인 파일 (이미지, 첨부파일등)
App.express.use('/attaches', express.static(path.join(root, 'data', 'uploads')));

/* 어플리케이션 실행 @param port 실행포트 */

App.start = () => {
  App.express.listen(appConfig.appPort, '0.0.0.0', () => {
    console.log(`[${isDev ? '개발모드' : '릴리즈모드'}] 서버가 작동되었습니다 : port ${appConfig.appPort}`);
  });
};

module.exports = App;
