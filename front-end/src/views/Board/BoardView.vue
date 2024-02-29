<template>
  <article>
    <div class="card mt-2">{{ boardInfo.title }} 게시판 상단 부분 입니다.</div>

    <!-- S: 이부분이 각각 목록/내용보기/작성하기 컴포넌트가 렌더링 됩니다 -->
    <!-- <router-view v-if="isLoaded" /> -->
    <!-- E: 이부분이 각각 목록/내용보기/작성하기 컴포넌트가 렌더링 됩니다 -->
    <BoardPostList :boardInfo="boardInfo" :boardKey = "boardKey"/>

    <footer class="card mt-2">{{ boardInfo.title }} 게시판 하단 부분 입니다.</footer>
  </article>
</template>

<script>
  import { ref, reactive, onMounted } from 'vue';
  // import { route } from 'vue-router';
  // import axios from 'axios';
  import myAxios from '@/plugins/axios';
  import BoardPostList from '@/views/Board/BoardPostList.vue';

  export default {
    components: {
      BoardPostList,
    },

    setup() {
      const isLoaded = ref(false);
      const boardInfo = reactive({
        title: '',
        type: 'LIST',
        auth_list: 0,
        auth_view: 0,
        auth_write: 0,
        auth_comment: 0,
        page_rows: 0,
        category_info: [],
      });

      const boardKey = 'notice'
      // const boardKey = computed(() => {
      //   return this.$route.params.boardKey;
      // });

      const getBoardInfo = async () => {
        try {
          await myAxios.get(`/board/notice`).then(result => {
            for (let key in result.data.result) {
              if (typeof boardInfo[key] !== 'undefined') {
                boardInfo[key] = result.data.result[key];
              }
            }

            console.log('board Info ' + boardInfo.title);

            // console.log(result.data.result);
            isLoaded.value = true;
          });
        } catch (err) {
          console.log(err);
        }
      };

      onMounted(() => {
        getBoardInfo();
      });

      return {
        isLoaded,
        boardInfo,
        boardKey,
      };
    },

    // mounted() {
    //   // 마운트되면 게시판의 정보를 불러옵니다.
    //   this.getBoardInfo();
    // },
  };
</script>
