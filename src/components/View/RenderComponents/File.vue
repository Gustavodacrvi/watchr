
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="File rb" :class="[status, {active: active === name}]"
      @click.stop='$emit("view")'

      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <span class="icon-wrapper">
        <Icon icon='file' style="opacity: .6;"/>
      </span>
      <span class="name-wrapper">
        <span class="name">{{ name }}</span>
      </span>
      <transition name="fade-t">
        <div v-if="hover || !isDesktopBreakPoint"
          class="info"

          @click.stop
        >
          <Icon v-if="status !== 'update'"
            class="icon remove-highlight cursor primary-hover"
            icon='import'
            title='Download file'
           
            @click.native="$emit('download')"
          />
          <Icon
            class="icon remove-highlight cursor primary-hover"
            icon='trash'
            color='var(--red)'
            title='Delete file'
           
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
  props: ['name', 'active', 'status', 'disableDelete'],
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
        s.transitionDuration = '.15s'
        s.opacity = 1
        s.height = '22px'

        setTimeout(done, 151);
        
      })

    },
    leave(el, done) {

      const s = el.style

      s.transitionDuration = '.15s'
      s.opacity = 0
      s.height = 0

      setTimeout(done, 151)
    },
  },
  computed: {
    ...mapGetters(['isDesktopBreakPoint']),
  },
}

</script>

<style scoped>

.File {
  display: flex;
  align-items: center;
  height: 22px;
  transition-duration: .15s;
  position: relative;
  font-size: 1.075em;
  cursor: pointer;
}

.File:hover, .active {
  background-color: var(--light-gray);
}

.icon-wrapper {
  margin-right: 6px;
  margin-left: 8px;
  transform: translateY(1px);
}

.name-wrapper {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  padding-left: 34px;
  padding-right: 8px;
  max-width: 100%;
}

.name {
  word-break: break-all;
  word-wrap: break-word;
}

.update {
  background-color: var(--light-gray) !important;
}

.update.active {
  background-color: var(--extra-light-gray) !important;
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
