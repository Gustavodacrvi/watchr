<template>
  <div class="Renderer">
    <transition-group class="root"
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <AppbarElement v-for="(el,i) in list"
        :type="type"
        :icon="icon"
        :key="el.id"
        :name="el.name"
        :tabindex="i + 1"
        :active="active"
        :viewType="viewType"
        :callback="el.callback"
        :options='el.options'

        :data-id="el.id"
      />
    </transition-group>
  </div>
</template>

<script>

import AppbarElementVue from './AppbarElement.vue'

import { Sortable } from '@shopify/draggable'

export default {
  components: {
    AppbarElement: AppbarElementVue,
  },
  props: ['list', 'icon', 'type', 'active', 'viewType'],
  mounted() {
    const sortable = new Sortable(this.getRoot(), {
      draggable: '.handle',
      mirror: {
        appendTo: 'body',
      },
    })
    sortable.on('sortable:stop', (evt) => {
      const childs = evt.newContainer.childNodes
      const ids = []
      for (const el of childs) {
        ids.push(el.dataset.id)
      }
      this.$emit('update', ids)
    })
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
    getRoot() {
      return this.$el.getElementsByClassName('root')[0]
    },
  },
}

</script>

<style>

.Renderer {
  position: relative;
}

.draggable-mirror {
  width: 288px;
}

</style>
