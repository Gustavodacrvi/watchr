<template>
  <transition-group class="Renderer appnav-renderer"
    @enter='enter'
    @leave='leave'
    tag="div"

    data-name='appnav-renderer'
  >
    <AppbarElement v-for="(el,i) in list"
      :iconColor='getIconColor(el)'
      :icon="getIcon(el)"

      :type="type"
      :subListIcon='subListIcon'
      :key="el.id"
      :name="el.name"
      :disableAction='el.disableAction'
      :tabindex="i + 1"
      :active="active"
      :isSmart='isSmart'
      :viewType="viewType"
      :callback="el.callback"
      :options='el.options'
      :list="el.list"
      :totalNumber='mapNumbers(el).total'
      :importantNumber='mapNumbers(el).notCompleted'

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
  props: ['list', 'icon', 'type', 'active', 'viewType', 'subListIcon', 'iconColor', 'mapNumbers', 'disableSort', 'isSmart'],
  data() {
    return {
      sortable: null,
      hover: false,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.$el, {
      sort: !this.disableSort,
      group: {name: 'appnav', pull: false, put: (l,j,item) => {
        const type = item.dataset.type
        if (type === 'task') return true
      }},
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
      },
      onStart: () => window.navigator.vibrate(100),
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
    getIcon(el) {
      if (this.icon) return this.icon
      return el.icon
    },
    getIconColor(el) {
      if (this.iconColor) return this.iconColor
      return el.iconColor
    }
  },
}

</script>
