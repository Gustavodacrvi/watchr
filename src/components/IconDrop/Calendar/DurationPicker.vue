<template>
  <div class="DurationPicker">
    <div class="wrapper">
      <div class="scroll-wrapper">
        <div class="display">
          00
        </div>
        <div class="label">
          hh
        </div>
      </div>
      <div class="scroll-wrapper">
        <div class="display">
          00
        </div>
        <div class="label">
          mm
        </div>
      </div>
    </div>
    <ButtonInput
      value='Save duration'
      icon='duration'
      defaultColor='var(--purple)'
      @click.native="saveDuration"
    />
  </div>
</template>

<script>

import ButtonInput from '../Components/Button.vue'

export default {
  components: {
    ButtonInput,
  },
  methods: {
    saveDuration() {

    },
  },
}

</script>

<style scoped>

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
}

.display {
  font-size: 3.8em;
  display: flex;
  align-items: flex-end;
}

.label {
  font-size: 2em;
  display: flex;
  align-items: flex-end;
  margin-left: 4px;
}

</style>
