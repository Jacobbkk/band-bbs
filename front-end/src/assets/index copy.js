import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';

import AuthorizeRoutes from './authorize.routes';
// import MyPageRoutes from './my.routes';
import BoardRoutes from './board.routes';
// import AgreementRoutes from './agreement.routes';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
  },
  ...AuthorizeRoutes,
  // ...MyPageRoutes,
  ...BoardRoutes,
  // ...AgreementRoutes,
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
