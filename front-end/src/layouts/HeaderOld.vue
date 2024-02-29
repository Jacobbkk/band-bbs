<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark" data-bs-theme="dark">
    <div class="container">
      <a class="navbar-brand" href="#">BanDee</a>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/">홈</router-link>
          </li>
        </ul>
        <ul class="navbar-nav justify-content-end">
          <li>
            <router-link class="nav-link" to="/board/">게시판</router-link>
          </li>
          <li v-if="compuLogin">
            <router-link class="nav-link" to="/userinfo">마이페이지</router-link>
          </li>

          <li v-if="compuLogin"><button class="btn btn-danger" type="button" @click="signOut">로그아웃</button></li>
          <li v-else><button class="btn btn-danger" type="button" @click="signIn">로그인</button></li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
  import userModel from '@/models/userModel';
  export default {
    name: 'HeaderOldVue',
    data() {
      return {
        isOK: false,
      };
    },
    computed: {
      compuLogin() {
        console.log('isLogin : ' + userModel.isLogin());
        //this.isOK = false;
        return userModel.isLogin();
      },
    },
    methods: {
      signIn() {
        if (this.$router.currentRoute.path !== '/signin') this.$router.push({ path: '/signin' });
      },

      signOut() {
        if (!confirm('로그아웃 하시겠습니까?')) return 
        userModel.processLogOut();
      },
    },
  };
</script>
