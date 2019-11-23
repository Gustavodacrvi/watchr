
<template>
  <div class="Folder AppbarElement">
    <div class="header rb cursor handle-folder AppbarElement-link"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

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
      <IconDrop class="drop"
        handle="settings-v"
        :hideHandle="!headerHover && isDesktop"
        :options="options"
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
import { mapGetters, mapState } from 'vuex'

export default {
  props: ['name', 'id', 'defaultShowing', 'movingFolder'],
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
    apply() {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: [this.id],
        taskIds: this.selectedTasks,
        type: 'folder',
      })
    },
    bindOptions() {
      const el = this.$el.getElementsByClassName('header')[0]
      utils.bindOptionsToEventListener(el, this.options, this.$parent)
    },
    go() {
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
    ...mapGetters(['l', 'isDesktop']),
    options() {
      return folderUtils.getFolderOptions({
        id: this.id, name: this.name,
      },this.l, this.$store, this.showing, this.toggle)
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
