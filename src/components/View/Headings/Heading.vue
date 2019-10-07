<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper" key="wr"
          @click="showing = !showing"
          @dblclick="toggleEditing"
          @mouseenter="onHover = true"
          @mouseleave="onHover = false"
        >
          <div class="header">
            <h4 class="name" :style="{color}">{{ name }}</h4>
            <IconDrop v-show="showIconDrop && options && options.length > 0" class="drop"
              handle='settings-h'
              :options='options'
              @edit='toggleEditing'
            />
          </div>
        </div>
        <transition name="fade">
          <div v-show="showing" class="cont">
              <slot></slot>
          </div>
        </transition>
      </div>
      <EditHeading v-else key="edig"
        :name='name'
        :errorToast='headingEdit.errorToast'
        :names='headingEdit.excludeNames'
        :buttonTxt='l["Save"]'
        @save='save'
        @cancel='toggleEditing'
      />
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop.vue'
import EditVue from './Edit.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'headingEdit', 'save'],
  components: {
    IconDrop: IconDropVue,
    EditHeading: EditVue,
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

.Heading {
  margin: 24px 0;
  position: relative;
}

.header-wrapper {
  border-bottom: 1px solid var(--light-gray);
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  height: 45px;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  margin: 0;
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
