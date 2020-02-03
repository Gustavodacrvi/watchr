
<template>
  <div class="Folder AppbarElement" :class="platform">
    <div class="header rb handle-folder AppbarElement-link DRAG-AND-DROP-EL"
      ref='header'
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
        class="arrow passive cursor primary-hover"
        icon='tiny-arrow'
        :class="{showCont: showing}"
        @click.native.stop='toggle'
      />
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

export default {
  mixins: [folderMixin],
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
      }, this.showing, this.toggle)
    },
  },
}

</script>

<style scoped src="@/assets/css/folder.css">
</style>
