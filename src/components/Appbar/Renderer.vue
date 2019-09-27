<template>
  <transition-group class="Renderer"
    @enter='enter'
    @leave='leave'
    tag="div"
  >
    <AppbarElement v-for="(el,i) in list"
      :type="type"
      :icon="icon"
      :subListIcon='subListIcon'
      :key="el.id"
      :name="el.name"
      :tabindex="i + 1"
      :active="active"
      :viewType="viewType"
      :callback="el.callback"
      :options='el.options'
      :list="el.list"

      :data-id="el.id"
    />
  </transition-group>
</template>

<script>

import Sortable from 'sortablejs'

export default {
  components: {
    AppbarElement: () => import('./AppbarElement.vue'),
  },
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon',],
  data() {
    return {
      sortable: null,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.$el, {
      group: 'appnav',
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

      onUpdate: (evt) => {
        setTimeout(() => {
          const childs = this.$el.childNodes
          const ids = []
          for (const el of childs)
            ids.push(el.dataset.id)
          this.$emit('update', ids)
        }, 100)
      }
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    enter(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '35px'
        setTimeout(() => done(), 300)
      })
    },
    leave(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 300)
    },
  },
}

</script>
