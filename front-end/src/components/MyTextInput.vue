<template>
  <my-input :label="label" :required="required">
    <input v-model="inputValue" @input="onUpdate" :required="required" />
  </my-input>
</template>
<script>
import MyInput from "@/components/MyInput.vue";

export default {
  components: {MyInput},
  props: {
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    value: {
      type: [String, Number],
      required: false,
      default: ''
    }
  },
  data () {
    return {
      inputValue: ''
    }
  },
  watch: {
    value () {
      this.inputValue = this.value
    }
  },
  methods: {
    onUpdate () {
      this.$emit('input', this.inputValue )
    }
  }
}
</script>