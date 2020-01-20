
<template>
  <div class="Folder AppbarElement" :class="platform">
    <div class="header rb cursor handle-folder AppbarElement-link"
      :class="{isActive}"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

      @touchend.passive='touchEnd'
      @touchstart.passive='touchstart'
      @touchmove.passive='touchmove'

      data-type='folder'
      data-color='var(--txt)'
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder"/>
      </span>
      <span class="name-wrapper">
        <transition name="name-t">
          <span v-if="!showSpecialInfo" class="name" key="nam"><b>{{ name }}</b></span>
          <span v-else key="f">{{ l['Apply selected tasks'] }}</span>
        </transition>
      </span>
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--fade)'
        opacity='0'
      />
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
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  props: ['name', 'id', 'defaultShowing', 'movingFolder', 'folder', 'viewName', 'viewType'],
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
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
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
      if (!this.showSpecialInfo) {
        this.$router.push({ path: '/user?folder=' + this.name })
      }
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
        naked: true
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
      return this.selected.length > 0
    },
    showSpecialInfo() {
      return this.headerHover && !this.isOnControl && this.isSelectingTasks
    },
    isActive() {
      return this.name === this.viewName && this.viewType === 'folder'
    },
  },
  watch: {
    options() {
      this.bindOptions()
    },
    selectedTasks() {
      setTimeout(() => {
        this.selected = [...this.selectedTasks]
      }, 10)
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
  overflow: hidden;
}

.mobile .header {
  height: 42px;
}

.header:hover, .isActive {
  background-color: var(--light-gray) !important;
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
