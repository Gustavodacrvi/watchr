
<template>
  <div class="Checkbox cursor" :class="{fade: !toggle}" @click="toggle = !toggle">
      <Icon v-if="icon" class="behind-icon"
        :icon='icon'
        :color='color'
      />
    <span class="cont">
      {{name}}</span>
    <div class="box cont">
      <Icon v-if="!toggle" icon="box"/>
      <Icon v-else icon="box-check"/>
    </div>
    <CircleBubble
      innerColor='var(--light-gray)'
      outerColor='var(--primary)'
      opacity='0'
    />
  </div>
</template>

<script>

export default {
  props: ['name', 'value', 'icon', 'color'],
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
  min-height: 35px;
  display: flex;
  align-items: center;
  transition-duration: .15s;
  position: relative;
  overflow: hidden;
}

.Checkbox:hover {
  background-color: rgba(87,160,222,.1);
  color: var(--primary);
}

.behind-icon {
  transform: translate(-6px, 1px);
}

.box {
  position: absolute;
  right: 26px;
  top: 55%;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
}

.fade .cont {
  opacity: .6;
}

</style>
