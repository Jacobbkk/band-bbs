<template>
  하하하
  <!-- <div class="row">
    <div class="col-1">#</div>
    <div class="col-6">제목</div>
    <div class="col-2">작성자</div>
    <div class="col-2">작성일시</div>
    <div class="col-1">조회수</div>
  </div>
  <div>
    <div class="row" v-if="listData.result.lengdiv === 0">
      <div>
        <div>등록된 글이 없습니다.</div>
      </div>
    </div>
    <div v-else>
      <div v-for="row in listData.result" :key="row.id" class="row">
        <div class="col-1">
          <span v-if="row.is_notice === 'Y'">[공지]</span>
          <span>{{ row.num }}</span>
        </div>
        <div class="col-5">
          <router-link :to="`/board/${row.board_key}/${row.id}`">{{ row.title }}</router-link>
        </div>
        <div class="col-2">{{ row.created_user_name }}</div>

        <div class="col-2">{{ $filters.snsDateTime(row.created_at) }}</div>

        <div class="col-1">{{ row.hit }}</div>
      </div>
    </div>
  </div> -->
</template>
