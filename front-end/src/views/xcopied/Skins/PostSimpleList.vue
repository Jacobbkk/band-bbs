<template>
  <div class = "table-view">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성일시</th>
          <th>조회수</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="listData.result.length === 0">
          <tr>
            <td colspan="5">등록된 글이 없습니다.</td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="row in listData.result" :key="row.id">
            <td>
              <span v-if="row.is_notice === 'Y'">[공지]</span>
              <!-- <span>{{ row.num | numberFormat }}</span> -->
               <span>{{ row.num }}</span>
            </td>
            <td>
              <router-link :to="`/board/${row.board_key}/${row.id}`">{{ row.title }}</router-link>
            </td>
            <td>{{ row.created_user_name }}</td>
            <!-- <td>{{ row.created_at | snsDateTime }}</td> -->
            <td>{{ row.created_at }}</td>
            <!-- <td>{{ row.hit | numberFormat }}</td> -->
            <td>{{ row.hit }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <paginate v-model="listData.page" :page-count="totalPages" :click-handler="getList" />
  </div>
</template>

<script>
  import Paginate from 'vuejs-paginate';

  export default {
    name: 'SimpleListSkin',
    components: { Paginate },
    computed: {
      totalPages() {
        return this.$parent.totalPages;
      },
      boardKey() {
        return this.$parent.boardKey;
      },
      boardInfo() {
        return this.$parent.boardInfo;
      },
      listData() {
        return this.$parent.listData;
      },
    },
    methods: {
      getList() {
        this.$emit('onGetList');
      },
    },
    filters: {
      // 숫자를 3자리마다 콤마를 붙여준다
      numberFormat(value) {
        if (value === 0 || value === '0') return '0';

        const reg = /(^[+-]?\d+)(\d{3})/;
        let n = value + '';

        while (reg.test(n)) {
          n = n.replace(reg, '$1' + ',' + '$2');
        }

        return n;
      },

      // 날짜를 sns의 ~분전 형식으로 변경해준다.

      snsDateTime(value) {
        if (value === null || value === '') return;

        const today = new Date();
        let date = new Date(value);

        const elapsedTime = Math.trunc((today.getTime() - date.getTime()) / 1000);

        let elapsedText = '';
        if (elapsedTime < 10) {
          elapsedText = '방금 전';
        } else if (elapsedTime < 60) {
          elapsedText = elapsedTime + '초 전';
        } else if (elapsedTime < 60 * 60) {
          elapsedText = Math.trunc(elapsedTime / 60) + '분 전';
        } else if (elapsedTime < 60 * 60 * 24) {
          elapsedText = Math.trunc(elapsedTime / 60 / 60) + '시간 전';
        } else if (elapsedTime < 60 * 60 * 24 * 10) {
          elapsedText = Math.trunc(elapsedTime / 60 / 60 / 24) + '일 전';
        } else {
          elapsedText = value.dateFormat('yy/MM/dd');
        }
        return elapsedText;
      },
    },
  };
</script>
