
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="File rb cursor" :class="status"
      @click.stop
    >
      <span class="icon-wrapper">
        <Icon icon='file' style="opacity: .6;"/>
      </span>
      <span class="name">{{ name }}</span>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

import utils from '@/utils'

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'status', 'disableDelete'],
  components: {
    Icon,
  },
  mounted() {
    utils.bindOptionsToEventListener(this.$el, this.options, this, 'click')
  },
  methods: {
    enter(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.opacity = 0
      s.height = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.opacity = 1
        s.height = '25px'

        setTimeout(done, 205);
        
      })

    },
    leave(el, done) {

      const s = el.style

      s.transitionDuration = '.2s'
      s.opacity = 0
      s.height = 0

      setTimeout(done, 205)
    },
  },
  computed: {
    options() {
      const obj = []
      if (!this.disableDelete) {
        obj.push({
          name: 'Delete file',
          icon: 'trash',
          important: true,
          callback: () => {this.$emit('delete')}
        })
      }
      if (this.status !== 'update') {
        obj.unshift(        {
            name: 'Download file',
            icon: 'import',
            callback: () => {this.$emit('download')}
          })
        obj.unshift({
            name: 'View file',
            icon: 'file',
            callback: () => {this.$emit('view')}
          })
      }
    return obj
    },
  },
}

</script>

<style scoped>

.File {
  display: flex;
  align-items: center;
  height: 25px;
  transition-duration: .15s;
}

.File:hover {
  background-color: var(--light-gray);
}

.icon-wrapper {
  margin-right: 6px;
  margin-left: 8px;
  transform: translateY(1px);
}

.name {
  word-break: break-all;
  word-wrap: break-word;
}

.update {
  background-color: rgba(53, 73, 90, 0.6) !important;
}

.remove {
  opacity: .2 !important;
}

</style>
