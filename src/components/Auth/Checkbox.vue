
<template>
  <div class="Checkbox cursor">
    <span>{{name}}</span>
    <div class="box">
      <Icon v-if="!toggle" icon="box"/>
      <Icon v-else icon="box-check"/>
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

export default {
  props: ['name', 'value'],
  components: {
    Icon,
  },
  data() {
    return {
      toggle: this.value,
    }
  },
  watch: {
    toggle() {
      this.$emit('input', this.toggle)
    },
    value() {
      this.toggle = this.value
    },
  }
}

</script>

<style scoped>

.Checkbox {
  padding: 0 26px;
  height: 35px;
  display: flex;
  align-items: center;
  transition-duration: .2s;
  position: relative;
}

.Checkbox:hover {
  background-color: rgba(87,160,222,.1);
  color: var(--primary);
}

.box {
  position: absolute;
  right: 10px;
  top: 55%;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

</style>
