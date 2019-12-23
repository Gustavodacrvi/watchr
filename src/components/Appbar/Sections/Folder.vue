
<template>
  <div class="Folder AppbarElement" :class="platform">
    <div class="header rb cursor handle-folder AppbarElement-link"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

      @touchend.passive='touchEnd'
      v-longclick='longClick'

      data-type='folder'
      data-color='var(--white)'
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
        outerColor='var(--gray)'
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
  props: ['name', 'id', 'defaultShowing', 'movingFolder', 'folder'],
  components: {
    Icon, IconDrop,
  },
  data() {
    return {
      showing: this.defaultShowing,
      headerHover: false,
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
        taskIds: this.selectedTasks,
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
      this.$store.commit('pushIconDrop', await this.getOptions(this.options))
    },
    touchEnd(e) {
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
  overflow: hidden;
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
