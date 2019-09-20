<template>
  <div class="IconDrop" @click.stop>
    <Icon class="cursor handle" :icon="handle" :primary-hover='true' @click="showing = true"/>
    <transition name="drop-trans"
      @beforeEnter="afterEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-show="showing" class="content cb rb">
        <transition name="links-trans">
          <div v-if="showingLinks" class="links">
            <div v-for="link in links" class="link"
              :key="link.name"
              @click="linkCallback(link.callback)"
            >
              <div class="link-cont">
                <Icon v-if="link.icon" class="cursor icon" :icon="link.icon"/>
                <span class="name">{{ link.name }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>

import IconVue from './Icon.vue'

export default {
  props: ['options', 'handle'],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      showing: false,
      showingLinks: true,
      links: this.options,
      height: 0,
      width: 0,
    }
  },
  created() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    linkCallback(callback) {
      if (callback) {
        const links = callback()
        const cont = this.getContent()
        
        const s = this.getStyles()
        const oldWidth = s.width
        const oldHeight = s.height

        cont.style.transitionDelay = '.25s';
        setTimeout(() => {
          cont.style.width = 'auto'
          cont.style.height = 'auto'
          setTimeout(() => {
            const {height, width} = this.getStyles()
            cont.style.width = oldWidth
            cont.style.height = oldHeight
            setTimeout(() => {
              cont.style.width = width
              cont.style.height = height
              cont.style.transitionDelay = '0s'
            }, 80)
          })
        }, 300)

        this.toggleLinks()        
        this.links = links
      }
    },
    toggleLinks() {
      const links = this.$el.getElementsByClassName('links')[0]
      this.showingLinks = false
      setTimeout(() => {
        this.showingLinks = true
      }, 300)
    },
    getContent() {
      return this.$el.getElementsByClassName('content')[0]
    },
    getStyles() {
      return getComputedStyle(this.getContent())
    },
    hide() {
      this.showing = false
      setTimeout(() => this.links = this.options, 400)
    },
    leave(el) {
      el.style.width = 0
      el.style.height = 0
    },
    enter(el) {
      const { height, width } = getComputedStyle(el)
      
      el.style.width = 0
      el.style.height = 0

      setTimeout(() => {
        el.style.width = width
        el.style.height = height
      })
    },
    afterEnter(el) {
      el.style.width = 'auto'
      el.style.height = 'auto'
    }
  }
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.handle {
  transition: color .2s;
}

.links {
  transition-duration: .2s;
  opacity: 1;
}

.hidden {
  opacity: 0;
}

.links-trans-enter, .links-trans-leave-to {
  opacity: 0;
  transition-duration: .3s;
}

.links-trans-leave, .links-trans-enter-to {
  opacity: 1;
  transition-duration: .3s;
}

.content {
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 0;
  padding: 18px 0;
  overflow: hidden;
  transition-duration: .3s;
}

.drop-trans-enter-active .link {
  transition-duration: .5s;
  transition-delay: .25s;
}

.drop-trans-leave-active .link {
  transition-duration: .1s;
}

.drop-trans-enter .link, .drop-trans-leave-to .link {
  opacity: 0;
}

.drop-trans-leave .link, .drop-trans-enter-to .link {
  opacity: 1;
}

.link {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition-duration: .3s;
  white-space: nowrap;
  height: 35px;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
}

.link .link-cont {
  display: flex;
  height: 100%;
  margin: 0 26px;
  align-items: center;
  justify-content: center;
}

.icon {
  position: relative;
  margin-right: 8px;
  bottom: -1.5px;
}

</style>
