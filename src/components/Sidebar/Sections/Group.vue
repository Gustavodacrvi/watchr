
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

      data-type='group'
      :data-id='id'
      data-color='var(--txt)'

      @dragover='dragover = true'
      @dragleave='dragover = false'
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="group"/>
      </span>
      <span class="name-wrapper">
        <span v-if="!editing" class="name"><b>{{ name }}</b></span>
        <input v-else
          class='edit-input'
          ref='editInput'
          v-model='editModel'
          @keydown='keydown'
        />
        <ProfilePhotos v-if="!editing"
          class="photos"
          :group='id'
          @click.native.stop
        />
        <transition v-if="!editing" name="fade-t">
          <div v-if="nonReadComments" class="comment-icon">
            <Icon
              icon='comment'
            />
            <span class="comm">
              {{nonReadComments}}
            </span>
          </div>
        </transition>
      </span>
      <div class='info'>
        <transition name="fade-t">
          <span v-if="assignedToMe" class="counter">
            {{assignedToMe}}
          </span>
        </transition>
        <transition name='fade-t'>
          <span v-if='headerHover' class="arrow-wrapper">
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

import folderMixin from "@/mixins/folder"
import sidebarmixin from "@/mixins/sidebarmixin"

import ProfilePhotos from "@/components/View/RenderComponents/GroupProfilePhotos.vue"

import groupUtils from '@/utils/group'
import { mapGetters } from 'vuex'

export default {
  mixins: [folderMixin, sidebarmixin],
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
    ...mapGetters({
      getAllNonReadComments: 'group/getAllNonReadComments',
      numberOfAssignedToMeTasks: 'task/numberOfAssignedToMeTasks',
    }),
    assignedToMe() {
      return this.numberOfAssignedToMeTasks(this.id)
    },
    nonReadComments() {
      return this.getAllNonReadComments(this.id).length
    },
    options() {
      return groupUtils.getGroupOptions(this.item)
    },
    isActive() {
      return this.name === this.viewName && this.viewType === 'group'
    },
  },
}

</script>

<style scoped src="@/assets/css/sidebarmixin.css"></style>

<style scoped src="@/assets/css/folder.css">
</style>

<style scoped>

.counter {
  position: absolute;
  right: 38px;
}

.photos {
  margin-left: 10px;
  margin-top: 2px;
}

.comment-icon {
  transform: translate(24px, 2px);
}

</style>
