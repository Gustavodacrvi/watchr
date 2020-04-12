<template>
  <div class="RadioOptions">
    <span v-for="o in options" :key="o"
      class="opt rb cursor remove-highlight"
      :class="{active: isActive(o)}"
      @click='toggle(o)'
    >
      <Icon icon='circle' width='10px'/>
      {{ o }}
    </span>
  </div>
</template>

<script>

export default {
  props: ['options'],
  data() {
    return {
      selected: [],
    }
  },
  methods: {
    toggle(opt) {
      if (this.selected.includes(opt)) {
        const index = this.selected.findIndex(el => el === opt)
        if (index > -1)
          this.selected.splice(index, 1)
      } else this.selected.push(opt)
    },
    isActive(opt) {
      return this.selected.includes(opt)
    },
  },
}

</script>

<style scoped>

.RadioOptions {
  margin: 10px;
  display: flex;
  justify-content: space-between;
}

.opt {
  display: inline-block;
  padding: 8px;
  transition-duration: .15s;
}

.opt:hover {
  background-color: var(--light-gray);
}

.opt:active {
  transform: scale(.95,.95);
}

.active {
  background-color: rgba(53, 73, 90, 0.6) !important;
  color: var(--primary);
}

</style>
