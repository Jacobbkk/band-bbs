<template>
  <table class="table table-striped">
    <thead class="thead-dark">
      <tr>
        <th scope="col">#</th>
        <th scope="col">Subject</th>
        <th scope="col">Post By</th>
        <th scope="col">Date</th>
        <th scope="col">Hits</th>
      </tr>
    </thead>
    <tbody>
      <template v-if="listData.result.lengdiv === 0">
        <tr>
          등록된 글이 없습니다.
        </tr>
      </template>
      <template v-else>
        <tr v-for="row in listData.result" :key="row.id">
          <th scope="row">
            <span v-if="row.is_notice === 'Y'">[공지]</span>
            <span>{{ row.num }}</span>
          </th>
          <td>
            <router-link :to="`/board/${row.board_key}/${row.id}`">{{ row.title }}</router-link>
          </td>
          <td>{{ row.created_user_name }}</td>

          <td>{{ $filters.snsDateTime(row.created_at) }}</td>

          <td>{{ row.hit }}</td>
        </tr>
      </template>
    </tbody>
  </table>

  <!-- <paginate v-model="listData.page" :page-count="totalPages" :click-handler="getList" /> -->
  <div v-for="row in listData.result" :key="row.id">
    <div>{{ row.title }}</div>
  </div>
</template>

<script>
  // import { computed } from 'vue';
  // import Paginate from 'vuejs-paginate';

  export default {
    name: 'SimpleListSkin',
    // components: { Paginate },
    props: {
      totalPages: {
        type: Number,
        default: 0,
      },
      boardKey: {
        type: String,
        default: null,
      },
      // boardInfo: {
      //   type: Object,
      //   default: () => {
      //     return {};
      //   },
      // },
      listData: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    emits: ['onGetList'],

    setup(props, { emit }) {
      const getList = () => {
        emit('onGetList');
        // console.log('onGetList events fired');
      };

      return {
        getList,
      };
    },
  };
</script>
