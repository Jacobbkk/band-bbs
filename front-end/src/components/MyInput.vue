<template>
  <my-form-row>
    <my-form-label :required="required">{{label}}</my-form-label>
    <my-form-input-wrap>
      <slot />
    </my-form-input-wrap>
  </my-form-row>
</template>
<script>
import MyFormRow from "@/components/MyFormRow.vue";
import MyFormLabel from "@/components/MyFormLabel.vue";
import MyFormInputWrap from "@/components/MyFormInputWrap.vue";

export default {
  components: {MyFormInputWrap, MyFormLabel, MyFormRow},
  props: {
    required: {
      type: Boolean,
      default: false,
      required: false
    },
    label : {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>