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
          color: '#ff4d4d',
          name: 'Red',
        },
        {
          color: '#f2241c',
          name: 'Dark Red',
        },
        {
          color: '#5a81e2',
          name: 'Light Blue',
        },
        {
          color: '#2b5cda',
          name: 'Dark Blue',
        },
        {
          color: '#ffff4d',
          name: 'Yellow',
        },
        {
          color: '#e4944e',
          name: 'Brown',
        },
        {
          color: '#a04dff',
          name: 'Purple',
        },
        {
          color: '#6b0fff',
          name: 'Dark Purple',
        },
        {
          color: '#E67C73',
          name: 'Flamingo',
        },
        {
          color: '#3efe45',
          name: 'Green',
        },
        {
          color: '#3dffa5',
          name: 'Olive',
        },
        {
          color: '#33B679',
          name: 'Sage',
        },
        {
          color: '#f68a46',
          name: 'Orange',
        },
        {
          color: '#F4511E',
          name: 'Tangerine',
        },
        {
          color: '#616161',
          name: 'Graphine',
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
