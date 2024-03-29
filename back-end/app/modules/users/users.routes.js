const router = require('express').Router()

// 컨트롤러 파일을 불러옵니다.
const controller = loadModule('users', 'controller');

// 경로를 지정하고 컨트롤러와 연결합니다.
router.post('/', controller.userRegister)
router.post('/authorize/phone', controller.phoneAuth)
router.get('/',controller.getInfo)
router.post('/authorize', controller.authorize)
router.post('/authorize/token', controller.refreshToken)

// 설정한 라우트 설정을 내보냅니다.
module.exports = router