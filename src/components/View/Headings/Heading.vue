<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper handle" key="wr"
          @click="showing = !showing"
          @dblclick="toggleEditing"
          @mouseenter="onHover = true"
          @mouseleave="onHover = false"
        >
          <div class="header">
            <h3 class="name" :style="{color}">{{ name }}</h3>
            <div class="icons" @click.stop>
              <transition name='fade-t'>
                <Icon v-if="header.autoHide" class="icon"
                  icon='archive'
                  @click="$emit('option-click', 'archive')"
                />
              </transition>
              <IconDrop class="icon"
                handle='settings-h'
                :options='options'
                :hideHandle='!showOptions'
                @edit='toggleEditing'
              />
            </div>
          </div>
        </div>
        <transition name="fade">
          <div v-show="showing" class="cont">
              <slot></slot>
          </div>
        </transition>
      </div>
      <div v-else key="edig">
        <EditHeading
          :name='name'
          :errorToast='headingEdit.errorToast'
          :names='headingEdit.excludeNames'
          :buttonTxt='l["Save"]'
          @save='save'
          @cancel='toggleEditing'
        />
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop.vue'
import IconVue from '../../Icon.vue'
import EditVue from './Edit.vue'

import { mapGetters } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'headingEdit', 'save'],
  components: {
    IconDrop: IconDropVue,
    Icon: IconVue,
    EditHeading: EditVue,
  },
  mounted() {
    utils.bindToContextMenu(this.$el, this.options, this)
  },
  data() {
    return {
      showing: true,
      onHover: false,
      editing: false,
    }
  },
  methods: {
    toggleEditing() {
      if (this.allowEdit)
        this.editing = !this.editing
    }
  },
  computed: {
    ...mapGetters(['l']),
    showOptions() {
      return this.showIconDrop && this.options && this.options.length > 0
    },
    showIconDrop() {
      const isDesktop = this.$store.getters.isDesktop
      if (isDesktop && this.onHover) return true
      else if (!isDesktop) return true
      return false
    },
  }
}

</script>

<style scoped>

.icons {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-left: 8px;
}

.IconDrop {
  transform: translateY(5px);
}

.Heading {
  margin: 24px 0;
  position: relative;
  z-index: 1;
}

.Heading:hover {
  z-index: 2;
}

.header-wrapper {
  border-bottom: 1px solid var(--light-gray);
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  height: 45px;
  z-index: 50;
  position: relative;
}

.cont {
  position: relative;
  z-index: 49;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  margin: 0;
  color: var(--primary);
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transition-duration: .2s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition-duration: .2s;
}

</style>
