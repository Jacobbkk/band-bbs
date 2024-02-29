<template>
  <SimpleListSkin :listData="listData" @onGetList="getPostList" />
  <!-- <SimpleListSkin :listData="listData" @onPageChange="onPageChange" @onGetList="getPostList" @onFilterUpdated="onFilterUpdated" @onSearch="onSearch" /> -->
</template>

<script>
  import SimpleListSkin from './Skins/PostSimpleList.vue';
  // import axios from 'axios';
  import myAxios from '@/plugins/axios';
  import { ref, reactive, computed, onMounted } from 'vue';

  export default {
    name: 'BoardPostList',
    components: { SimpleListSkin },
    props: {
      boardInfo: {
        type: Object,
        default: () => {
          return {};
        },
      },
      boardKey: {
        type: String,
        default: 'notice',
      },
    },

    setup(props) {
      // const boardKey = 'notice';

      const listData = reactive({
        result: [], // 게시글 목록
        page: 1, // 현재 페이지
        totalCount: 0, // 총 게시글 수
      });

      const totalPages = computed(() => {
        return props.boardInfo.page_rows === 0 ? 1 : Math.ceil(listData.totalCount / props.boardInfo.page_rows);
      });

      const filters = ref({
        type: 'title', // 검색구분
        q: '', // 검색어
      });

      const onPageChange = page => {
        listData.page = page;
      };

      const getPostList = () => {
        const formData = {};
        formData.searchColumn = filters.value.type;
        formData.searchQuery = filters.value.q;
        formData.page = listData.page;
        formData.page_rows = props.boardInfo.page_rows;

        console.log('page rows' + formData.page_rows);
        console.log('리스트 데이타 page' + formData.page);

        // 게시글 목록 불러오기 REST API 요청
        myAxios
          .get(`/board/${props.boardKey}/posts`, {
            params: formData,
          })
          .then(res => {
            listData.result = res.data.result;
            listData.totalCount = res.data.totalCount;

            // console.log('listData.result ' + listData.result);
            // console.log('totalCount ' + listData.totalCount);
          });
      };

      const onFilterUpdated = filters => {
        filters.value.type = filters.type;
        filters.value.q = filters.q;
      };

      const onSearch = () => {
        listData.value.page = 1;
        getPostList();
      };

      onMounted(() => {
        getPostList();
      });

      return {
        // boardKey,
        totalPages,
        listData,
        filters,
        onPageChange,
        getPostList,
        onFilterUpdated,
        onSearch,
      };
    },

    // mounted() {
    //   $nextTick(() => {
    //     getPostList();
    //   });
    // },
  };
</script>
