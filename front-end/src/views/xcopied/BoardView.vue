<template>
  <article>
    <div class="bd-header">{{ boardInfo.title }} 게시판 상단 부분 입니다.</div>

    <!-- S: 이부분이 각각 목록/내용보기/작성하기 컴포넌트가 렌더링 됩니다 -->
    <router-view v-if="isLoaded" />
    <!-- E: 이부분이 각각 목록/내용보기/작성하기 컴포넌트가 렌더링 됩니다 -->

    <footer>{{ boardInfo.title }} 게시판 하단 부분 입니다.</footer>
  </article>
</template>

<script>
export default {
    computed: {
      boardKey() {
        return this.$route.params.boardKey;
      },
    },
    data() {
      return {
        isLoaded: false,
        boardInfo: {
          title: '',
          type: 'LIST',
          auth_list: 0,
          auth_view: 0,
          auth_write: 0,
          auth_comment: 0,
          page_rows: 0,
          category_info: [],
        },
      };
    },
    methods: {
      async getBoardInfo() {
        // REST API를 이용하여 게시판 정보를 가져옵니다.
        await this.$axios.get(`/board/notice`).then(result => {
          for (let key in result.data.result) {
            if (typeof this.boardInfo[key] !== 'undefined') {
              this.boardInfo[key] = result.data.result[key];
            }
          }
          console.log(result.data.result);
          this.isLoaded = true;
        });
     
        console.log('보드키는 ' + this.boardKey);
      },
    },
    mounted() {
      // 마운트되면 게시판의 정보를 불러옵니다.
      this.getBoardInfo();
    },
    watch: {
      boardKey() {
        // boardKey 값이 변경된다면 게시판 정보를 새로 불러옵니다.
        this.getBoardInfo();
      },
    },
  };
</script>
