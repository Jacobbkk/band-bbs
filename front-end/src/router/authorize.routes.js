export default [
  { path: '/authorize/sign-up', name: 'SignUp', component: () => import(/* webpackChunkName: "authorize.sign-up" */ '../views/Authorize/SignUp.vue') },
  { path: '/authorize/sign-in', name: 'SignIn', component: () => import(/* webpackChunkName: "authorize.sign-in" */ '../views/Authorize/SignIn.vue') },
];
