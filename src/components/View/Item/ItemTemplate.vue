<template>
  <transition
    appear
    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div
      class="ItemTemplate draggable"
      :class="layout"
    >
      <slot name="root"></slot>
      <div
        class="cont-wrapper item-handle rb"
        ref='cont-wrapper'
      >
        <ItemCont
          v-bind="item"
          
          :movingItem='movingItem'
          :isSelecting='isSelecting'
        />

          
      </div>
    </div>
  </transition>
</template>

<script>

import ItemCont from './ItemCont.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    ItemCont,
  },
  props: ['itemHeight', 'item', 'movingItem', 'isSelecting'],
  methods: {
    enter(el, done) {
      const cont = this.$refs['cont-wrapper']
      const parentIds = this.$parent.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(this.item.id)) {
        const i = parentIds.findIndex(id => id === this.item.id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 0
      s.height = 0
      s.minHeight = 0
      
      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.2s'
        s.opacity = 1
        s.height = this.itemHeight + 'px'
        s.minHeight = this.itemHeight + 'px'
        
        setTimeout(() => {
          s.transitionDuration = '.2s'
          s.height = 'auto'
          done()
        }, 205)
      })
    },
    leave(el, done) {
      const cont = this.$refs['cont-wrapper']
      const parentIds = this.$parent.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(this.item.id)) {
        const i = parentIds.findIndex(id => id === this.item.id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 0
      s.height = 0
      
      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.2s'
        s.opacity = 1
        s.height = this.itemHeight + 'px'

        setTimeout(() => {
          s.transitionDuration = '.2s'
          s.height = 'auto'
          done()
        }, 205)
      })
    },
  },
  computed: {
    ...mapGetters(['layout']),
  },
}

</script>


<style scoped>

.cont-wrapper {
  position: relative;
  z-index: 5;
  height: 100%;
}

.desktop .cont-wrapper:hover, .desktop .cont-wrapper:active {
  background-color: var(--light-gray);
}

</style>
