<template>
  <div>
    <div class="">
      <form @submit.prevent="onLogin">
        <div>
          <label for="id">아이디</label>
          <input id="id" type="email" placeholder="이메일 주소" v-model.trim="formData.loginId" required />
        </div>
        <div>
          <label for="pass">비밀번호</label>
          <input id="pass" placeholder="비밀번호" :type="passwordInputType" v-model.trim="formData.loginPass" required />
          <button type="button" @click="togglePasswordVisible">{{ passwordViewButtonText }}</button>
        </div>
        <div><button variant="login" type="submit">로그인</button></div>
        <div><router-link to="/authorize/sign-up">회원가입</router-link></div>
      </form>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import userModel from '@/models/userModel';

  export default {
    name: 'SignIn',
    setup() {
      const ui = {
        passwordVisible: ref(false),
      };

      const formData = {
        loginId: ref(''),
        loginPass: ref(''),
      };

      const router = useRouter();

      const passwordInputType = () => {
        return ui.passwordVisible.value ? 'text' : 'password';
      };

      const passwordViewButtonText = () => {
        return ui.passwordVisible.value ? '감추기' : '보이기';
      };

      const togglePasswordVisible = () => {
        ui.passwordVisible.value = !ui.passwordVisible.value;
      };

      const onLogin = () => {
        if (formData.loginId.value === '') {
          alert('아이디를 입력하세요');
          return;
        }

        if (formData.loginPass.value === '') {
          alert('비밀번호를 입력하세요');
          return;
        }

        userModel
          .requestLogin({
            loginId: formData.loginId.value,
            loginPass: formData.loginPass.value,
          })
          .then(() => {
            router.replace('/');
          });
      };

      return {
        ui,
        formData,
        passwordInputType,
        passwordViewButtonText,
        togglePasswordVisible,
        onLogin,
      };
    },
  };
</script>
