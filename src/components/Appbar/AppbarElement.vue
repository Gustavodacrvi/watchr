<template>
  <div class="AppbarElement AppbarElement-link rb handle"
    :tabindex="tabindex"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    :class="[platform,{notSmartActive: !isSmart && isActive, isSelectedEl, onHover: hover}]"

    @click.stop="linkCallback"
    @touchstart.passive='touchStart'
    @touchend.passive='touchEnd'
    v-longclick='longClick'
  >
    <div class='circle-trans-wrapper-wrapper'>
      <div class="circle-trans-wrapper">
        <transition
          @enter='circleEnter'
        >
          <div v-if="showCircle" class="circle-trans-transition"
            :style="{left, top, backgroundImage: `radial-gradient(var(--light-gray), var(--gray))`}"
          ></div>
        </transition>
      </div>
    </div>
    <a class='scroll-link'
      :href="isDesktop ? '' : '#view-header'"
      @click.prevent
      @contextmenu.prevent
      v-smooth-scroll='{duration: 500, offset: -500}'
    >
      <div
        class="link-wrapper cursor remove-highlight AppbarElement-link rb"
        :data-type='type'
        :data-selectedtype='selectedtype'
        :data-color='iconColor'
        :data-disabled='disableAction'
      >
        <div class="icon-wrapper">
          <Icon class="main-icon"
            :style="hoverStyle"
            :class="{notActive: !isActive}"
            :icon="icon"
            :progress='progress'
            :circle='true'
          />
        </div>
        <div class="name-wrapper">
          <transition name="name-t">
            <span v-if="!showSpecialInfo" key="normal" class="name" :style="hoverStyle">{{ getName }}</span>
            <span v-else class="name" key="apply" :style="hoverStyle">{{ l['Apply selected tasks'] }}</span>
          </transition>
          <div class="info">
            <template v-if="helpIcons">
              <Icon v-for="i in helpIcons" :key="i" class="inf faded"
                :icon='i'
                :circle='true'
              />
            </template>
            <span v-if="getStringObj" :style="{color: getStringObj.color}">{{ getStringObj.name }}</span>
            <span v-if="importantNumber" class="inf important">{{ importantNumber }}</span>
            <span v-if="totalNumber" class="inf total">{{ totalNumber }}</span>
          </div>
        </div>
      </div>
    </a>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'

import { mapGetters, mapState, mapActions } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options', 'totalNumber', 'importantNumber',
  'disableAction', 'selected', 'id', 'progress', 'helpIcons', 'string', 'selectedtype'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
  },
  data() {
    return {
      hover: false,
      showCircle: false,
      isTouching: false,
      left: 0,
      top: 0,
      doingTransition: false,
      allowMobileOptions: false,
    }
  },
  mounted() {
    this.bindOptions()
  },
  methods: {
    ...mapActions(['getOptions']),
    longClick() {
      if (!this.isDesktop && !this.isDragging) {
        window.navigator.vibrate(100)
        this.allowMobileOptions = true
      }
    },
    async bindOptions() {
      if (this.isDesktop) {
        if (this.options) {
          const el = this.$el.getElementsByClassName('link-wrapper')[0]
          utils.bindOptionsToEventListener(el, await this.getOptions(this.options), this)
        }
      }
    },
    async openMobileOptions() {
      this.$store.commit('pushIconDrop', await this.getOptions(this.options))
    },
    touchStart(e) {
      this.isTouching = true
      this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY
      const rect = e.target.getBoundingClientRect()
      const scroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - scroll) + 'px'
        this.showCircle = true
      }
    },
    touchEnd(e) {
      this.isTouching = false
      const touch = e.changedTouches[0]
      const movedFingerX = Math.abs(touch.clientX - this.startX) > 10
      const movedFingerY = Math.abs(touch.clientY - this.startY) > 10
      if (!movedFingerX && !movedFingerY) {
        if (this.allowMobileOptions)
          this.openMobileOptions()
        else this.click()
      }
      this.allowMobileOptions = false
    },
    circleEnter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 450
      let outerTrans = 250
      if (this.isTouching) {
        innerTrans += 150
        outerTrans += 150
      }

      trans('0s')
      s.opacity = 0
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 100
      setTimeout(() => {
        trans(`.${innerTrans}s`)
        s.opacity = 1
        s.width = width + 'px'
        s.height = width + 'px'
        setTimeout(() => {
          trans(`.${outerTrans}s`)
          s.width = width + 'px'
          s.height = width + 'px'
          s.opacity = 0
          setTimeout(() => {
            trans('0')
            s.width = 0
            s.height = 0
            this.showCircle = false
            this.doingTransition = false
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    linkCallback(evt) {
      if (this.isDesktop) this.click()
    },
    click() {
      if (this.callback && !this.showSpecialInfo) this.callback()
      else if (this.isOnControl && this.selectedEmpty) this.$emit('select')
      else if (this.showSpecialInfo && !this.selectedEmpty) {
        this.$emit('apply', this.selectedtype)
        this.$store.commit('clearSelected')
      }
    }
  },
  computed: {
    ...mapState({
      drag: 'drag',
      isOnControl: 'isOnControl',
      selectedTasks: 'selectedTasks',
      viewName: 'viewName',
      storeViewType: 'viewType',
    }),
    ...mapGetters(['l', 'platform', 'isDesktop']),
    isDraggingOver() {
      return this
    },
    getStringObj() {
      if (!this.string) return null
      return {...this.string}
    },
    showSpecialInfo() {
      return this.hover && !this.isOnControl && !this.selectedEmpty
    },
    selectedEmpty() {
      return this.selectedTasks.length === 0
    },
    isSelectedEl() {
      return this.selected.includes(this.id)
    },
    getName() {
      if (this.isSmart) return this.l[this.name]
      return this.name
    },
    hoverStyle() {
      return `color: ${this.isActive ? this.iconColor : ''};`
    },
    isActive() {
      if ((this.hover && this.isDesktop) || (this.isTouching && !this.isDesktop)) return true
      return this.name === this.active && this.type === this.viewType || (this.viewName === this.name && this.type === this.storeViewType)
    },
  },
  watch: {
    options() {
      this.bindOptions()
    },
  }
}

</script>

<style scoped>

.icon-wrapper {
  height: 100%;
  width: 40px;
  position: relative;
}

.name-wrapper {
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.main-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin-top: 1.5px;
  transition: color .15s;
}

.link-wrapper {
  height: 100%;
  position: relative;
  display: flex;
  transition-duration: .15s;
}

.name {
  transition-duration: .15s;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateY(0px);
}

.icon.notActive {
  color: var(--gray);
}

.AppbarElement {
  outline: none;
  position: relative;
  height: 35px;
  transition: background-color .15s, height .3s;
}

.AppbarElement.mobile {
  height: 42px;
}

.sortable-ghost .link-wrapper {
  display: none;
}


.desktop .link-wrapper:hover, .notSmartActive {
  background-color: var(--light-gray) !important;
}

.link-wrapper:active {
  background-color: var(--card) !important;
}

.sortable-ghost {
  background-color: var(--void) !important;
  transition-duration: 0 !important;
  transition: none !important;
}

.info {
  display: flex;
  align-items: center;
  position: absolute;
  right: 6px;
  height: 100%;
  z-index: 5;
}

.inf {
  margin-left: 8px;
}

.faded {
  opacity: .6;
}

.drop {
  transform: translateY(2px);
}

.total {
  color: var(--gray);
}

#task-on-hover {
  transform: scale(1.01,1.01);
}

#task-on-hover .inf, #task-on-hover .icon, #task-on-hover .name {
  color: white !important;
  stroke: white;
}

.isSelectedEl {
  background-color: rgba(53, 73, 90, 0.6) !important;
}

.name-t-enter {
  opacity: 0;
  transform: translateY(-25px); 
}

.name-t-enter-active, .name-t-leave-active {
  position: absolute;
  transition-duration: .15s;
}

.name-t-enter-to, .name-t-leave {
  transform: translateY(0px);
  opacity: 1;
}

.name-t-leave-to {
  opacity: 0;
  transform: translateY(25px);
}

.onHover {
  z-index: 10;
}

</style>
