<template>
  <div class="--form-label">
    <slot />
    <span class="required ms-1" v-if="required">(필수입력)</span>
  </div>
</template>

<style lang="scss" scoped>
.--form-label {
  width:100px;
  flex-shrink: 0;
  font-size:1rem;
  font-weight:700;
  padding-top:.725rem;
  padding-right:.375rem;

  .required {
    font-size:0;
    display:inline-block;
    vertical-align: top;

    &:before {
      content:'*';
      color:red;
      font-size:.9rem;
    }
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