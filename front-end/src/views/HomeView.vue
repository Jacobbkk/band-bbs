<template>
  <div class="home">
    <div class="wrap_intro">
      <!-- <img alt="Vue logo" src="../assets/condo_intro.jpg" /> -->
      <div class="intro_msg">
        <p>Ratchade Presitige Condo</p>
      </div>
    </div>
    <!-- <HelloWorld msg="Welcome to the hope page" /> -->
  </div>
</template>

<style lang="scss" scoped>
  .wrap_intro {
    margin: 0 auto;
    padding: 20px;
    background-image: url('../assets/condo_intro01.jpg');
    background-size: cover;
    display: flex;
    justify-content: center;
    max-width: 800px;
    height: 400px;
    .intro_msg {
      display: inline-flex;
      width: 80%;
      justify-content: center;
      flex-wrap: wrap;
      font-size: 4rem;
      color: whitesmoke;
      border: solid 5px #eee;
    }
  }
</style>

<script>
  // Components
  // import HelloWorld from '@/components/HelloWorld.vue';

  export default {
    name: 'HomeView',
    components: {
      // HelloWorld,
    },
  };
</script>
