
<template>
  <div class="Folder">
    <div class="header rb cursor handle-folder"
      @click="toggle"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder"/>
      </span>
      <span class="name"><b>{{ name }}</b></span>
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
import { mapGetters } from 'vuex'

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
    bindOptions() {
      const el = this.$el.getElementsByClassName('link-wrapper')[0]
      utils.bindOptionsToEventListener(this.$el, this.options, this.$parent)
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
    ...mapGetters(['l', 'isDesktop']),
    options() {
      return [
        {
          name: this.l['Toggle folder'],
          icon: 'folder',
          callback: () => this.toggle()
        },
        {
          name: this.l['Edit folder'],
          icon: 'pen',
          callback: () => this.edit(),
        },
        {
          name: this.l['Delete folder'],
          icon: 'trash',
          important: true,
          callback: () => this.delete()
        },
      ]
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
  margin: 8px 0;
}

.header {
  position: relative;
  display: flex;
  height: 35px;
  transition-duration: .15s;
}

.header:hover {
  background-color: var(--light-gray);
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

.name {
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
