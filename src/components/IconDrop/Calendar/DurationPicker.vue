<template>
  <div class="DurationPicker">
    <div class="wrapper">
      <div class="scroll-wrapper">
        <DurationScroll
          :max='24'
          v-model="hour"
        />
        <div class="label">
          h
        </div>
      </div>
      <div class="scroll-wrapper">
        <DurationScroll
          :max='60'
          v-model="min"
        />
        <div class="label">
          m
        </div>
      </div>
    </div>
    <ButtonInput class="btn"
      value='Save duration'
      icon='duration'
      defaultColor='var(--purple)'
      @click.native="saveDuration"
    />
  </div>
</template>

<script>

import ButtonInput from '../Components/Button.vue'
import DurationScroll from './DurationScroll.vue'

export default {
  props: ['callback'],
  components: {
    ButtonInput,
    DurationScroll,
  },
  data() {
    return {
      hour: 0,
      min: 0,
    }
  },
  methods: {
    saveDuration() {
      const opt = this.callback(`${this.hour}:${this.min}`)

      if (!opt || (opt && opt.then))
        this.$emit('close')
      else this.$emit('update', opt)
    },
  },
}

</script>

<style scoped>

.btn {
  z-index: 2;
  position: relative;
}

.DurationPicker {
  width: 275px;
}

.wrapper {
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scroll-wrapper {
  margin: 12px;
  display: flex;
  position: relative;
  height: 100%;
}

.label {
  font-size: 1.8em;
  display: flex;
  align-items: center;
  transform: translateY(-3px);
  margin-left: 8px;
}

</style>
