<template>
  <div class="Renderer">
    <transition-group
      @enter='enter'
      @leave='leave'
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
      />
    </transition-group>
  </div>
</template>

<script>

import AppbarElementVue from './AppbarElement.vue'

export default {
  components: {
    AppbarElement: AppbarElementVue,
  },
  props: ['list', 'icon', 'type', 'active', 'viewType'],
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
