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
      @click="select(c)"
    >
      <div class="fill" :style="{backgroundColor: c.color}"></div>
    </div>
  </div>
</template>

<script>

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
    colors() {
      return [
        {
          color: '#DE5757',
          name: 'Red',
        },
        {
          color: '#ea3a34',
          name: 'Dark Red',
        },
        {
          color: '#5f5abe',
          name: 'Dark Blue',
        },
        {
          color: '#FFE366',
          name: 'Yellow',
        },
        {
          color: '#daa85d',
          name: 'Brown',
        },
        {
          color: '#4fe39e',
          name: 'Olive',
        },
        {
          color: '#a160eb',
          name: 'Purple',
        },
        {
          color: '#914dff',
          name: 'Dark Purple',
        },
        {
          color: '#57DE5B',
          name: 'Green',
        },
        {
          color: '#FFA166',
          name: 'Orange',
        },
      ]
    },
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
  border-radius: 6px;
  transition-duration: .2s;
}

.fill {
  width: 30px;
  height: 30px;
  border-radius: 1000px;
}

.color:hover {
  background-color: var(--extra-light-gray);
  cursor: pointer;
}

.bloqued {
  transform: translateY(2px);
}

</style>
