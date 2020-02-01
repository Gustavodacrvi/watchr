
<template>
  <div class="Folder AppbarElement" :class="platform">
    <div class="header rb cursor handle-folder AppbarElement-link DRAG-AND-DROP-EL"
      :class="{isActive}"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

      @touchend.passive='touchEnd'
      @touchstart.passive='touchstart'
      @touchmove.passive='touchmove'

      data-type='folder'
      :data-id='id'
      data-color='var(--txt)'
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder"/>
      </span>
      <span class="name-wrapper">
        <span class="name" key="nam"><b>{{ name }}</b></span>
      </span>
      <Icon
        class="arrow passive primary-hover"
        icon='tiny-arrow'
        :class="{showCont}"
        @click.native.stop='toggle'
      />
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--fade)'
        opacity='0'
      />
    </div>
    <div class="cont" :class="{showCont}">
      <transition
        @enter='contEnter'
        @leave='contLeave'
      >
        <div v-if="showCont">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'
import IconDrop from '@/components/IconDrop/IconDrop.vue'

import utils from "@/utils"
import folderUtils from "@/utils/folder"
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  props: ['name', 'id', 'defaultShowing', 'movingFolder', 'folder', 'viewName', 'viewType', 'listLength'],
  components: {
    Icon, IconDrop,
  },
  data() {
    return {
      showing: this.defaultShowing,
      headerHover: false,

      startTime: 0,
      fail: 0,
      startX: 0,
      startY: 0,
      initialScroll: 0,
      timeout: null,
      selected: [],
    }
  },
  mounted() {
    this.bindOptions()
  },
  methods: {
    ...mapActions(['getOptions']),
    apply() {
      this.$store.dispatch('task/handleTasksBySidebarElementDragAndDrop', {
        elIds: [this.id],
        taskIds: this.selected,
        type: 'folder',
      })
    },
    async bindOptions() {
      if (this.isDesktop) {
        const el = this.$el.getElementsByClassName('header')[0]
        utils.bindOptionsToEventListener(el, await this.getOptions(this.options), this)
      }
    },
    async openMobileOptions() {
      window.navigator.vibrate(100)
      this.$store.commit('pushIconDrop', await this.getOptions(this.options))
    },
    touchEnd(e) {
      clearTimeout(this.timeout)
      const time = new Date() - this.startTime
      
      if (!this.fail && (time < 250))
        this.click()
      this.fail = false
      this.allowMobileOptions = false
    },
    touchmove(evt) {
      const touch = evt.changedTouches[0]
      const move = Math.abs(document.scrollingElement.scrollTop - this.initialScroll) > 5 || Math.abs(touch.clientX - this.startX) > 5 || Math.abs(touch.clientY - this.startY) > 5
      if (move) {
        clearTimeout(this.timeout)
        this.fail = true
      }
    },
    touchstart(e) {
      this.initialScroll = document.scrollingElement.scrollTop
      this.startTime = new Date()
      const touch = e.changedTouches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY
      
      this.timeout = setTimeout(() => {
        this.openMobileOptions()
      }, 350)
    },
    go() {
      if (this.isDesktop) this.click()
    },
    click() {
      this.$router.push('/user?folder=' + this.name)
    },
    toggle() {
      this.showing = !this.showing
      this.$store.dispatch('folder/saveFolder', {
        id: this.id,
        defaultShowing: this.showing,
      })
    },
    edit() {
      this.$store.dispatch('pushPopup', {
        comp: "AddFolder",
        payload: {
          name: this.name,
          id: this.id,
          editing: true,
        },
        naked: true
      })
    },
    delete() {
      this.$store.dispatch('folder/deleteFolderById', {
        id: this.id,
        lists: this.$store.state.list.lists
      })
    },
    contEnter(el) {

      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.height = this.getFolderContHeight
        s.opacity = 1
      })
    },
    contLeave(el) {
      const s = el.style
      
      s.transitionDuration = 0
      s.height = this.getFolderContHeight
      s.opacity = 1
      
      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.height = this.itemHeight + 'px'
        s.opacity = 0
      })
    },
  },
  computed: {
    ...mapState(['selectedItems', 'isOnControl']),
    ...mapGetters(['isDesktop', 'platform']),
    showCont() {
      return this.showing && !this.movingFolder
    },
    options() {
      return folderUtils.getFolderOptions({
        ...this.folder, id: this.id, name: this.name,
      }, this.showing, this.toggle)
    },
    getFolderContHeight() {
      return (this.itemHeight * this.listLength) + 'px'
    },
    itemHeight() {
      return this.isDesktop ? 35 : 42
    },
    isActive() {
      return this.name === this.viewName && this.viewType === 'folder'
    },
  },
  watch: {
    options() {
      this.bindOptions()
    },
    selectedItems() {
      setTimeout(() => {
        this.selected = [...this.selectedItems]
      }, 10)
    },
    folder() {
      this.bindOptions()
    }
  }
}

</script>

<style scoped>

.showCont {
  margin-bottom: 12px;
}

.header {
  position: relative;
  display: flex;
  height: 35px;
  transform: scale(1,1); /* used for drag and drop */
  transition-duration: .15s;
  overflow: hidden;
}

.mobile .header {
  height: 42px;
}

.header:hover, .isActive {
  background-color: var(--dark);
}

.icon {
  color: var(--fade);
  transform: translateY(2px);
  transition-duration: .15s;
}

.icon.headerHover {
  color: var(--txt);
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 100%;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 8px;
  transition-duration: .2s;
  transform: translateY(-50%) rotate(-90deg);
}

.arrow.showCont {
  top: 55%;
  transform: translateY(-50%) rotate(0deg);
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

</style>
