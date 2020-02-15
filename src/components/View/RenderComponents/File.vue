
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="File rb" :class="status"
      @click.stop
      @dblclick="$emit('view')"

      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <span class="icon-wrapper">
        <Icon icon='file' style="opacity: .6;"/>
      </span>
      <span class="name">{{ name }}</span>
      <transition name="fade-t">
        <div v-if="hover || !isDesktop" class="info">
          <Icon
            class="icon remove-highlight cursor primary-hover"
            icon='import'
            title='Download file'
            :circle='true'
            @click.native="$emit('download')"
          />
          <Icon
            class="icon remove-highlight cursor primary-hover"
            icon='trash'
            color='var(--red)'
            title='Delete file'
            :circle='true'
            @click.native="$emit('delete')"
          />
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>

import utils from '@/utils'

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'status', 'disableDelete'],
  data() {
    return {
      hover: false,
    }
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
        s.height = '30px'

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
    ...mapGetters(['isDesktop']),
  },
}

</script>

<style scoped>

.File {
  display: flex;
  align-items: center;
  height: 30px;
  transition-duration: .15s;
  position: relative;
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

.info {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.icon + .icon {
  margin-left: 6px;
}

</style>
