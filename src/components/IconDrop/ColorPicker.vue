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
    },
    select({color}) {
      this.callback({color})
    },
  },
  computed: {
    colors() {
      return [
        {
          color: 'var(--red)',
          name: 'Red',
        },
        {
          color: 'var(--dark-red)',
          name: 'Dark Red',
        },
        {
          color: 'var(--dark-blue)',
          name: 'Dark Blue',
        },
        {
          color: 'var(--yellow)',
          name: 'Yellow',
        },
        {
          color: 'var(--brown)',
          name: 'Brown',
        },
        {
          color: 'var(--olive)',
          name: 'Olive',
        },
        {
          color: 'var(--purple)',
          name: 'Purple',
        },
        {
          color: 'var(--dark-purple)',
          name: 'Dark Purple',
        },
        {
          color: 'var(--green)',
          name: 'Green',
        },
        {
          color: 'var(--orange)',
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
