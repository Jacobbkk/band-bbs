import { createRouter, createWebHistory } from 'vue-router';


import HomeView from '../views/HomeView.vue';
import BoardLayout from '../views/Board/BoardView.vue';

import AuthorizeRoutes from './authorize.routes';
// import MyPageRoutes from './my.routes';
// import BoardRoutes from './board.routes';
import AgreementRoutes from './agreement.routes';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    // component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  ...AuthorizeRoutes,
  {
    path: '/board/:boardKey',
    name: 'BoardLayout',
    component: BoardLayout,
    // component: () => import(/* webpackChunkName: "board" */ '../views/Board/BoardView.vue'),
    children: [
      { path: '', name: 'PostList', component: () => import(/* webpackChunkName: "board.postList" */ '../views/Board/BoardPostList.vue') },
      { path: 'write', name: 'PostWrite', component: () => import(/* webpackChunkName: "board.postWrite" */ '../views/Board/BoardPostWrite.vue') },
      { path: ':postId', name: 'PostView', component: () => import(/* webpackChunkName: "board.postView" */ '../views/Board/BoardPostView.vue') },
      { path: ':postId/edit', name: 'PostEdit', component: () => import(/* webpackChunkName: "board.postEdit" */ '../views/Board/BoardPostWrite.vue') },
      { path: ':parentPostId/reply', name: 'PostReply', component: () => import(/* webpackChunkName: "board.postReply" */ '../views/Board/BoardPostWrite.vue') },
    ],
  },
  // ...MyPageRoutes,
  // ...BoardRoutes,
  ...AgreementRoutes,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


import userModel from '@/models/userModel';
router.beforeEach((to, from, next) => {
  const isRequiredLogin = to.meta?.requiredLogin === true;

  // 로그인이 필요한 페이지인데 로그인이 되어 있지 않다면
  if (isRequiredLogin && !userModel.isLogin()) {
    next('/authorize/sign-in');
  } else {
    next();
  }
});

export default router;
