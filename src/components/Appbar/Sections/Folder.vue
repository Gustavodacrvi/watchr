
<template>
  <div class="Folder AppbarElement" :class="platform">
    <div class="header rb cursor handle-folder AppbarElement-link"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

      @touchstart='touchStart'
      @touchend='touchEnd'
      v-longclick='longClick'

      data-type='folder'
      data-color='var(--white)'
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
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder"/>
      </span>
      <span class="name-wrapper">
        <transition name="name-t">
          <span v-if="!showSpecialInfo" class="name" key="nam"><b>{{ name }}</b></span>
          <span v-else key="f">{{ l['Apply selected tasks'] }}</span>
        </transition>
      </span>
    </div>
    <div class="content">
      <div v-show="showing && !movingFolder">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'
import IconDrop from '@/components/IconDrop/IconDrop.vue'

import utils from "@/utils"
import folderUtils from "@/utils/folder"
import { mapGetters, mapState } from 'vuex'

export default {
  props: ['name', 'id', 'defaultShowing', 'movingFolder', 'folder'],
  components: {
    Icon, IconDrop,
  },
  data() {
    return {
      showing: this.defaultShowing,
      headerHover: false,
      showCircle: false,
      isTouching: false,
      left: 0,
      top: 0,
      doingTransition: false,
    }
  },
  mounted() {
    this.bindOptions()
  },
  methods: {
    apply() {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: [this.id],
        taskIds: this.selectedTasks,
        type: 'folder',
      })
    },
    bindOptions() {
      if (this.isDesktop) {
        const el = this.$el.getElementsByClassName('header')[0]
        utils.bindOptionsToEventListener(el, this.options, this.$parent)
      }
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
    openMobileOptions() {
      this.$store.commit('pushIconDrop', this.options)
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
    longClick() {
      if (!this.isDesktop && !this.isDragging) {
        window.navigator.vibrate(100)
        this.allowMobileOptions = true
      }
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
    go() {
      if (this.isDesktop) this.click()
    },
    click() {
      if (!this.showSpecialInfo)
        this.$router.push('/user?folder=' + this.name)
      else this.apply()
    },
    toggle() {
      this.showing = !this.showing
    },
    edit() {
      this.$store.dispatch('pushPopup', {
        comp: "AddFolder",
        payload: {
          name: this.name,
          id: this.id,
          editing: true,
        },
      })
    },
    delete() {
      this.$store.dispatch('folder/deleteFolderById', {
        id: this.id,
        lists: this.$store.state.list.lists
      })
    },
  },
  computed: {
    ...mapState(['selectedTasks', 'isOnControl']),
    ...mapGetters(['l', 'isDesktop', 'platform']),
    options() {
      return folderUtils.getFolderOptions({
        ...this.folder, id: this.id, name: this.name,
      }, this.showing, this.toggle)
    },
    isSelectingTasks() {
      return this.selectedTasks.length > 0
    },
    showSpecialInfo() {
      return this.headerHover && !this.isOnControl && this.isSelectingTasks
    },
  },
  watch: {
    options() {
      this.bindOptions()
    },
    folder() {
      this.bindOptions()
    }
  }
}

</script>

<style scoped>

.Folder {
  margin: 12px 0;
}

.header {
  position: relative;
  display: flex;
  height: 35px;
  transition-duration: .15s;
}

.mobile .header {
  height: 42px;
}

.header:hover {
  background-color: var(--light-gray) !important;
}

.icon {
  color: var(--gray);
  transform: translateY(2px);
  transition-duration: .15s;
}

.icon.headerHover {
  color: var(--white);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 100%;
}

.name-wrapper {
  display: flex;
  align-items: center;
}

.drop {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
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

</style>
