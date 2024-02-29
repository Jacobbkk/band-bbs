<template>
  하하하
  <!-- <table>
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
           
            <span>{{ row.num }}</span>
          </td>
          <td>
            <router-link :to="`/board/${row.board_key}/${row.id}`">{{ row.title }}</router-link>
          </td>
          <td>{{ row.created_user_name }}</td>
         
          <td>{{ row.created_at }}</td>
         
          <td>{{ row.hit }}</td>
        </tr>
      </template>
    </tbody>
  </table> -->
</template>
