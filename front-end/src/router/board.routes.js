export default [
  {
    path: '/board/:boardKey',
    name: 'BoardLayout',
    component: () => import(/* webpackChunkName: "board" */ '../views/Board/BoardView.vue'),
    children: [
      { path: '', name: 'PostList', component: () => import(/* webpackChunkName: "board.postList" */ '../views/Board/BoardPostList.vue') },
      { path: 'write', name: 'PostWrite', component: () => import(/* webpackChunkName: "board.postWrite" */ '../views/Board/BoardPostWrite.vue') },
      { path: ':postId', name: 'PostView', component: () => import(/* webpackChunkName: "board.postView" */ '../views/Board/BoardPostView.vue') },
      { path: ':postId/edit', name: 'PostEdit', component: () => import(/* webpackChunkName: "board.postEdit" */ '../views/Board/BoardPostWrite.vue') },
      { path: ':parentPostId/reply', name: 'PostReply', component: () => import(/* webpackChunkName: "board.postReply" */ '../views/Board/BoardPostWrite.vue') },
    ],
  },
];
