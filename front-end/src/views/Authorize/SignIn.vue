<template>
  <div>
    <div class="sign-in-wrap">
      <form @submit.prevent="onLogin">
        <ul class="wrapper">
          <li class="form-row">
            <label for="id"><i class="bi bi-file-person" /></label>
            <input id="id" type="email" placeholder="이메일 주소" v-model.trim="formData.loginId" required />
          </li>
          <li class="form-row">
            <label for="pass"><i class="bi bi-lock" /></label>
            <input id="pass" name="current-password" placeholder="비밀번호" :type="passwordInputType" v-model.trim="formData.loginPass" autocomplete="on" required />

            <i v-if="ui.passwordVisible" class="bi bi-eye fs-4" @click="togglePasswordVisible" />
            <i v-else class="bi bi-eye-slash fs-4" @click="togglePasswordVisible" />

            <!-- <button type="button" @click="togglePasswordVisible">{{ passwordViewButtonText }}</button> -->
          </li>
          <li class="form-row">
            <button type="submit" class="btn btn-primary btn-block">로그인</button>
          </li>
        </ul>
        <div><router-link to="/authorize/sign-up">회원가입</router-link></div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .sign-in-wrap {
    max-width: 400px;
    height: 400px;
    border: solid #eee;
    margin: 0 auto;
    padding: 20px;
    // display: flex;
    // flex-direction: column;
    // justify-content: space-between;
    // align-items: flex-start;

    .wrapper {
      background-color: whitesmoke;
      list-style-type: none;
      padding: 0.5em;
      border-radius: 3px;
      .form-row {
        display: flex;
        justify-content: flex-end;
        padding: 0.5em;

        label {
          padding: 0.5em 1em 0.5em 0;
        }
        input {
          flex: 1;
        }
        input,
        button {
          padding: 0.5em;
        }
      }
    }
  }
</style>

<script>
  import userModel from '@/models/userModel';
  export default {
    name: 'SignIn',
    data() {
      return {
        ui: {
          passwordVisible: false,
        },
        formData: {
          loginId: '',
          loginPass: '',
        },
      };
    },
    computed: {
      passwordInputType() {
        return this.ui.passwordVisible ? 'text' : 'password';
      },
      passwordViewButtonText() {
        return this.ui.passwordVisible ? '감추기' : '보이기';
      },
    },
    methods: {
      togglePasswordVisible() {
        this.ui.passwordVisible = !this.ui.passwordVisible;
      },
      onLogin() {
        // 폼검증
        if (this.formData.loginId === '') {
          alert('아이디를 입력하세요');
          return;
        }

        if (this.formData.loginPass === '') {
          alert('비밀번호를 입력하세요');
          return;
        }

        userModel
          .requestLogin({
            loginId: this.formData.loginId,
            loginPass: this.formData.loginPass,
          })
          .then(() => {
            // 사용자의 로그인 처리완료시 / 페이지로 이동합니다.
            // if (this.$router.currentRoute.path !== '/about') this.$router.push('/about' );
            console.log('로그인 성공');
          });
      },
    },
  };
</script>
