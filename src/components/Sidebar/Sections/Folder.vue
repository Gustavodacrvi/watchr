
<template>
  <div class="Folder AppbarElement" :class="layout">
    <div class="header rb handle-folder AppbarElement-link DRAG-AND-DROP-EL"
      ref='header'
      :class="{isActive, dragover}"
      @click="go"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"

      @touchend.passive='touchEnd'
      @touchstart.passive='touchstart'
      @touchmove.passive='touchmove'

      data-type='folder'
      :data-id='id'
      data-color='var(--txt)'

      @dragover='dragover = true'
      @dragleave='dragover = false'
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder" width='13px'/>
      </span>
      <span class="name-wrapper">
        <span v-if="!editing" class="name" key="nam"><b>{{ name }}</b></span>
        <input v-else
          class='edit-input'
          ref='editInput'
          v-model='editModel'
          @keydown='keydown'
        />
      </span>
      <div class="info">
        <transition name='fade-t'>
          <span v-if="headerHover" class="arrow-wrapper">
            <span class="arrow-wrapper-wrapper">
              <Icon
                class="arrow passive cursor primary-hover"
                icon='tiny-arrow'
                :class="{showCont: showing}"
                @click.native.stop='toggle'
              />
            </span>
          </span>
        </transition>
      </div>
    </div>
    <div class="cont" :class="{showCont: showing}">
      <transition
        @enter='contEnter'
        @leave='contLeave'
      >
        <div v-if="showing">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>

import folderUtils from "@/utils/folder"

import folderMixin from "@/mixins/folder"
import sidebarmixin from "@/mixins/sidebarmixin"

export default {
  mixins: [folderMixin, sidebarmixin],
  methods: {
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
  },
  computed: {
    options() {
      return folderUtils.getFolderOptions({
        ...this.item, id: this.id, name: this.name,
      })
    },
    isActive() {
      return this.name === this.viewName && this.viewType === 'folder'
    },
  },
}

</script>

<style scoped src="@/assets/css/sidebarmixin.css"></style>

<style>

.sortable-ghost .SidebarElement {
  visibility: hidden;
  opacity: 0;
}

</style>

<style scoped src="@/assets/css/folder.css">
</style>
