<template>
  <div class="header-container">
    <ul>
      <li><i class="bi-building-check fs-3"></i></li>
    </ul>
    <div class="nav_bar">
      <nav><router-link to="/">Home</router-link> | <router-link to="/about">About</router-link> | <router-link to="/authorize/sign-in">SignIn</router-link> | <router-link to="/authorize/sign-up">SignUp</router-link> | <router-link to="/board/notice">Board</router-link> | <router-link to="/board/notice/write">Write</router-link> |</nav>
    </div>
    <div class="user-status">
      <ul>
        <li>{{ stateUser }}</li>
        <li v-if="isLogin">
          <button type="button" class="btn btn-danger btn-block" @click="signOut">로그아웃</button>
        </li>
        <li v-if="isLogin"><i class="bi-person-check fs-3"></i></li>
        <li v-else><i class="bi-person-slash fs-3"></i></li>
      </ul>
    </div>
  </div>
</template>
<script>
  import userModel from '@/models/userModel';
  export default {
    computed: {
      // isLogin() {
      //   return userModel.isLogin();
      // },
      stateUser() {
        return userModel.isLogin() ? this.loginUser.nickname : 'Guest';
      },
    },
    methods: {
      signOut() {
        if (!confirm('로그아웃 하시겠습니까?')) return;
        userModel.processLogOut();
        // if (this.$router.currentRoute.path !== '/authorize/sign-in') this.$router.push({ path: '/authorize/sign-in' });
      },
    },
    // mounted() {
    //   console.log(this.lang? this.lang: '랭귀지 몰라');
    // },
    watch: {
      checkUser() {
        this.stateUser();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    background-color: whitesmoke;
    border-bottom: #eee;

    ul {
      list-style: none;
      li {
        float: left;
        margin: 20px;
      }
    }

    nav {
      padding: 30px;

      a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
          color: #42b983;
        }
      }
    }
  }
</style>
