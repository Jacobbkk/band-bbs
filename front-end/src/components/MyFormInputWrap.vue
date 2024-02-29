<template>
  <div class="--form-wrap">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.--form-wrap {
  flex:1;
  padding:.375rem .75rem .375rem 0;

  .--form-label + & {
    padding-left:.375rem;
  }
}
</style>

<script>
export default {
  props: {
    required: {
      type: Boolean,
      default: false,
      required: false
    }
  }
}
</script>