<template>
  <div class="ColorPicker">
    <div
      class="color"
      title="Remove color"
      
      @click="noColor"
    >
      <Icon class="bloqued"
        icon='bloqued'
        width='30px'
      />
    </div>
    <div v-for="c in colors" :key="c.color"
      class="color"
      :title="c.name"
      :class="{active: c.color === color}"
      
      @click="select(c)"
    >
      <div class="fill" :style="{backgroundColor: c.color}"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: ['color', 'callback'],
  methods: {
    noColor() {
      this.callback({color: null})
      this.$emit('close')
    },
    select({color}) {
      this.callback({color})
      this.$emit('close')
    },
  },
  computed: {
    ...mapGetters(['colors']),
  },
}

</script>

<style scoped>

.ColorPicker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 0;
  grid-auto-rows: 55px;
}

.color {
  position: relative;
  width: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transition-duration: .175s;
}

.fill {
  width: 30px;
  height: 30px;
  border-radius: 1000px;
}

.color:hover, .active {
  background-color: var(--extra-light-gray);
  cursor: pointer;
}

.bloqued {
  transform: translateY(2px);
}

</style>
