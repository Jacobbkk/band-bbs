<template>
  <component :is="boardInfo.type" @onPageChange="onPageChange" @onGetList="getPostList" @onFilterUpdated="onFilterUpdated" @onSearch="onSearch" />
</template>

<script>
  import SimpleListSkin from './Skins/PostSimpleList.vue';
  import GallerySkin from './Skins/PostGallery.vue';
  import WebZineSkin from './Skins/PostWebzine.vue';
  import { getCurrentInstance } from 'vue';

  export default {
    components: {
      LIST: SimpleListSkin,
      GALLERY: GallerySkin,
      WEBZINE: WebZineSkin,
    },
    setup() {
      const instance = getCurrentInstance();
      console.log('아버지는: ' + instance.type.name);
    },
    computed: {
      // instance() {
      //   return getCurrentInstance;
      // },
      boardKey() {
        // return this.$parent.boardKey;
        return this.instance.parent.boardKey;
        // return 'notice';
      },
      boardInfo() {
        // 부모컴포넌트의 boardInfo 데이타를 가져옵니다.
        // return this.$parent.boardInfo;
        return this.instance.parent.boardInfo;
      },
      totalPages() {
        return this.boardInfo.page_rows === 0 ? 1 : Math.ceil(this.listData.totalCount / this.boardInfo.page_rows);
      },
    },
    data() {
      return {
        // 게시글 목록을 저장하는 객체
        listData: {
          result: [], // 게시글 목록
          page: 1, // 현재 페이지
          totalCount: 0, // 총 게시글 수
        },
        // 게시판 검색에 사용되는 객체
        filters: {
          type: 'title', // 검색구분
          q: '', // 검색어
        },
      };
    },
    methods: {
      onPageChange(page) {
        this.listData.page = page;
      },
      // 게시글 목록 불러오기
      getPostList() {
        // 게시글 불러오기시 GET 패러미터를 정리해준다.
        const formData = {};
        formData.searchColumn = this.filters.type;
        formData.searchQuery = this.filters.q;
        formData.page = this.listData.page;
        formData.page_rows = this.boardInfo.page_rows;

        console.log('보드인포' + JSON.stringify(this.boardInfo));

        // 게시글 목록 불러오기 REST API 요청
        this.$axios
          .get(`/board/${this.boardKey}/posts`, {
            params: formData,
          })
          .then(res => {
            this.listData.result = res.data.result;
            this.listData.totalCount = res.data.totalCount;
          });
      },
      onFilterUpdated(filters) {
        this.filters.type = filters.type;
        this.filters.q = filters.q;
      },
      onSearch() {
        this.listData.page = 1;
        this.getPostList();
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.getPostList();
      });
    },
    watch: {
      // 게시판 고유키가 변경될경우 게시글 목록도 다시 불러옵니다.
      boardKey() {
        this.getPostList();
      },
    },
  };
</script>
