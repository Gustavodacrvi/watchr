<template>
  <div class="HeaderIcon cursor"
    :class="{active: (active && !simple), simple}"
    
    @click='headerClick'
  >
    <SmartDrop v-if="!simple" :ref='id'
      v-bind="props"
      
      :active='active'
      :tagMode='false'
      :headerIcon='true'

      @close='active = false'
    />
    <Icon v-else class="icon"
      :class="id"
      v-bind="props"
    />
  </div>
</template>

<script>

import SmartDrop from "@/components/Icons/SmartIconDrop.vue"

export default {
  components: {
    SmartDrop,
  },
  props: ['id', 'props', 'simple'],
  data() {
    return {
      active: false,
      model: {
        deadline: undefined,
        calendar: undefined,
        list: undefined,
        folder: undefined,
        group: undefined,
        taskDuration: undefined,
        priority: undefined,
        tags: undefined,
      },
    }
  },
  methods: {
    headerClick() {
      if (this.simple && this.props.callback)
        this.props.callback()
      else if (!this.simple)
        this.active = true
    },
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
        if (this.active) {
          const keys = Object.keys(this.model)
          this.$emit('save',
            keys.filter(key => this.model[key] !== undefined)
            .reduce((obj, key) => ({...obj, [key]: this.model[key]}), {})
          )
          this.active = false
        }
      },
    }
  },
}

</script>

<style scoped>

.HeaderIcon {
  height: 28px;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transform: scale(1,1);
  transition-duration: .175s;
}

.simple .icon {
  margin-top: 3px;
}

.HeaderIcon:hover, .active {
  background-color: var(--light-gray);
}

.HeaderIcon:active {
  transform: scale(.98,.98);
}

.go_back {
  transform: rotate(90deg);
}

.go_next {
  transform: rotate(-90deg);
}

</style>
