<template>
  <div>
    <h2>{{ boardInfo.title }}</h2>
    <article>
      <header>
        <h4>{{ postInfo.title }}</h4>
        <dl>
          <dt>작성자</dt>
          <dd>{{ postInfo.created_user_name }}</dd>
        </dl>
        <dl>
          <dt>작성일시</dt>
          <dd>{{ postInfo.created_at }}</dd>
          <!-- <dd>{{ postInfo.created_at | snsDateTime }}</dd> -->

        </dl>
        <dl>
          <dt>조회수</dt>
          <dd>{{ postInfo.hit }}</dd>
          <!-- <dd>{{ postInfo.hit | numberFormat }}</dd> -->
        </dl>
      </header>

      <div v-if="postInfo.status === 'Y'">
        <div v-html="postInfo.content"></div>
      </div>
      <div v-else>
        <p>해당 글은 블라인드 처리되어 내용을 볼 수 없습니다.</p>
      </div>
    </article>

    <template v-if="isAuthor">
      <router-link :to="`/board/${boardKey}/${postId}/edit`">수정</router-link>
      <button type="button" @click="deletePost">수정</button>
    </template>
    <router-link :to="`/board/${boardKey}/${postId}/reply`">답글달기</router-link>

    <div class="popup" v-if="ui.deleteDialogView">
      <div class="popup-window">
        <form @submit.prevent="deletePost">
          <template v-if="postInfo.created_user === 0 && loginUser.auth < 10">
            <my-text-input type="password" label="비밀번호" v-model="ui.deletePassword" />
          </template>

          <button type="submit">삭제하기</button>
          <button type="button" @click="ui.deleteDialogView = false">취소</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10001;
      background: rgba(0, 0, 0, 0.4);
    }
    .popup-window {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 400px;
      height: 400px;
      z-index: 10002;
      transform: translate(-50%, -50%);
      background-color: #fff;
    }
  }
</style>

<script>
  import boardModel from '@/models/boardModel';
  import MyTextInput from '@/components/MyTextInput.vue';
  // import { del } from 'vue';

  export default {
    components: { MyTextInput },
    data() {
      return {
        postInfo: {},
        ui: {
          deleteDialogView: false,
          deletePassword: '',
        },
      };
    },
    computed: {
      boardKey() {
        return this.$route.params?.boardKey ?? '';
      },
      postId() {
        return this.$route.params?.postId ?? 0;
      },
      boardInfo() {
        return this.$parent.boardInfo;
      },
      // 수정/삭제권한이 있는지 여부를 리턴
      isAuthor() {
        // 관리자 권한인 경우 무조건 true
        if (this.loginUser.auth >= 10) return true;

        // 현재 로그인이 안되있으면서, 작성자도 비회원일경우 true
        if (this.boardInfo.created_user === 0 && this.loginUser.id === 0) {
          return true;
        }

        // 작성자 PK와 현재 로그인한 사용자 PK가 같을때 true
        if (this.boardInfo.created_user === this.loginUser.id) {
          return true;
        }

        return false;
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.getPostInfo();
      });
    },
    watch: {
      postId() {
        this.getPostInfo();
      },
      boardKey() {
        this.getPostInfo();
      },
    },
    methods: {
      // del,
      deletePost() {
        // 만약 삭제확인 창이 열려있지 않은 상태라면 삭제 확인 창을 연다
        if (!this.ui.deleteDialogView) {
          this.ui.deleteDialogView = true;
          return;
        }

        // 삭제확인 창이 열려있는 상태에서 이창이 호출되었다는 것은 삭제확인을 눌렀다는것으로 보로 실제 삭제 명령을 REST API로 전달한다.
        // 단, 비회원 작성글인 경우, 비밀번호 입력이 되었는지 체크해야한다.
        if (this.boardInfo.created_user === 0 && this.loginUser.auth < 10) {
          if (this.ui.deletePassword === '') {
            alert('글 작성시 입력한 비밀번호를 입력하세요');
            return;
          }
        }

        // REST API에 전송
        this.$axios
          .delete(`/board/${this.boardKey}/posts/${this.postId}`, {
            password: this.ui.deletePassword,
          })
          .then(() => {
            alert('글이 삭제되었습니다.');
            this.$router.replace(`/board/${this.boardKey}`);
          });
      },
      getPostInfo() {
        boardModel.getPost(this.boardKey, this.postId).then(res => {
          this.postInfo = res.data.result;

          // 조회수 처리하기
          boardModel.submitHit(this.boardKey, this.postId);
        });
      },
    },
  };
</script>
