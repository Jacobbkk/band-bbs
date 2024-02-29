const router = require('express').Router()

// 컨트롤러 파일을 불러옵니다.
const controller = loadModule('board', 'controller');

router.get('/:boardKey', controller.getBoardInfo)
router.get('/:boardKey/posts', controller.getPostList)
router.get('/:boardKey/posts/:postId/comments', controller.getPostList)
router.get('/:boardKey/posts/:postId', controller.getPost)
router.post('/:boardKey/posts', controller.writeBoardPost)
router.put('/:boardKey/posts/:postId', controller.writeBoardPost)
router.post('/:boardKey/posts/:postId/hit', controller.increasePostHit)
router.delete('/:boardKey/posts/:postId', controller.deletePost)

module.exports = router