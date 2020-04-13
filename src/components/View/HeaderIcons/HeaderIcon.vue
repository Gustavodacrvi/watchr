<template>
  <div class="HeaderIcon cursor"
    :class="{active}"
    @click='active = true'
  >
    <SmartDrop :ref='id'
      v-bind="props"
      
      :active='active'
      :tagMode='false'
      :headerIcon='true'
    />
  </div>
</template>

<script>

import SmartDrop from "@/components/Icons/SmartIconDrop.vue"

export default {
  components: {
    SmartDrop,
  },
  props: ['id', 'props'],
  data() {
    return {
      active: false,
      model: {
        calendar: null,
      },
    }
  },
  methods: {
    hide(evt) {

      let found
      const path = evt.path || (evt.composedPath && evt.composedPath())
      for (const node of path)
        if (node === this.$el) {
          found = true
          break
        }
      
      if (!found)
        this.active = false
    },
  },
  watch: {
    active() {
      if (this.active)
        window.addEventListener('click', this.hide)
      else
        window.removeEventListener('click', this.hide)
    },
    model: {
      deep: true,
      handler() {
        this.$emit('save', {...this.model})
        this.active = false
      },
    }
  },
}

</script>

<style scoped>

.HeaderIcon {
  height: 30px;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transition-duration: .2s;
}

.HeaderIcon:hover, .active {
  background-color: var(--light-gray);
}

</style>
