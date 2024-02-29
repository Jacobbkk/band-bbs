/**
 * 마이페이지
 */
export default [{ path: '/my', name: 'MyPage', component: () => import(/* webpackChunkName: "my.page" */ '../views/My/MyPage.vue'), meta: { requiredLogin: true } }];
