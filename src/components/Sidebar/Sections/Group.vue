
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

      data-type='group'
      :data-id='id'
      data-color='var(--txt)'
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="group"/>
      </span>
      <span class="name-wrapper">
        <span class="name"><b>{{ name }}</b></span>
        <ProfilePhotos
          class="photos"
          :group='id'
          @click.native.stop
        />
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

import folderMixin from "@/mixins/folder"

import ProfilePhotos from "@/components/View/RenderComponents/GroupProfilePhotos.vue"

import groupUtils from '@/utils/group'

export default {
  mixins: [folderMixin],
  components: {
    ProfilePhotos,
  },
  created() {
    this.showing = localStorage.getItem(`group_toggle_${this.name}`) === 'true'
  },
  methods: {
    click() {
      this.$router.push('/user?group=' + this.name)
    },
    toggle() {
      this.showing = !this.showing
      localStorage.setItem(`group_toggle_${this.name}`, this.showing)
    },
  },
  computed: {
    options() {
      return groupUtils.getGroupOptions(this.item)
    },
    isActive() {
      return this.name === this.viewName && this.viewType === 'group'
    },
  },
}

</script>

<style scoped src="@/assets/css/folder.css">
</style>

<style scoped>

.photos {
  margin-left: 10px;
  margin-top: 2px;
}

</style>
