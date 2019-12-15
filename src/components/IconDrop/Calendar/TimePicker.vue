<template>
  <div class="TimePicker">
    <span v-if="content.msg" class="msg">{{ content.msg }}</span>
    <div class="wrapper">
      <VTimePicker
        :noTitle='true'
        :scrollable='true'
        :dark='true'

        width='225px'
      />
    </div>
  </div>
</template>

<script>

export default {
  props: ['content']
}

</script>

<style>

.v-picker {
  color: var(--white) !important;
  box-shadow: none !important;
}

.v-picker__body {
  background-color: var(--card) !important;
}

.v-time-picker-clock {
  background-color: var(--light-gray) !important;
}

.v-picker__title__btn {
  opacity: .6 !important;
}

.v-picker__title__btn--active {
  color: white !important;
  opacity: 1 !important;
}

.v-time-picker-clock__hand, .v-time-picker-clock__item--active {
  background-color: var(--primary) !important;
}

</style>

<style scoped>

.msg {
  margin-left: 34px;
}

.wrapper {
  width: 275px !important;
  display: flex;
  justify-content: center;
}

</style>
