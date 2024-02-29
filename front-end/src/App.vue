<template>
  <div id="app">
    <HeaderView />
    <router-view></router-view>
  </div>
</template>
<script>
  import HeaderView from '@/layouts/HeaderView.vue';
  export default {
    components: { HeaderView },
  };
</script>

<style lang="scss" scoped>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
</style>
