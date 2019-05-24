<template>
  <transition name='fade-transition'>
    <div class='section-input' v-if='showing'>
      <div>
        <input :class='$store.state.theme.style' class='input' name='input' :placeholder='placeholder' autocomplete='off' v-model='value'/>      
      </div>
      <alert class='left pointer' @click='$emit("click")'>Add</alert>
      <alert class='right pointer' type='error' @click='showing = false'>Cancel</alert>
    </div>
  </transition>  
</template>

<script lang="ts">
import Vue from 'vue';
import Alert from '@/components/generalComponents/Alert.vue';

export default Vue.extend({
  components: {
    alert: Alert,
  },
  props: {
    placeholder: String,
    show: Boolean,
  },
  data() {
    return {
      value: '',
      showing: this.show,
    };
  },
});
</script>

<style scoped>

.section-input {
  margin: 20px 0;
}

.input {
  background-color: transparent;
  outline: none;
  padding: 6px;
  color: #999999;
  font-family: 'Work Sans';
  border-radius: 12px;
  border: 1px solid #999999;
}

.left {
  float: left;
}

.right {
  float: right;
}

</style>
