<template>
  <div class='navbar'>
    <div class='relatives'>
      <div class='left'>
        <div class='icon' @click='openAppBar();$emit("iconclick")'>
          <div class='line'></div>
          <div class='line middle'></div>
          <div class='line'></div>
        </div>
        <span class='title'>{{ navBarTitle }}</span>
      </div>
      <div class='right'>
        <span class='nav-options cancel-sortable-unselect'>
          <icon-options v-if='navBarOptions && navBarOptions.length > 0'
            handle='ellipsis-v'
            size='lg'
            min-width='225px'
            :options='navBarOptions'
          />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'

import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'

import { ListIcon } from '../../interfaces/app'

@Component({
  components: {
    'icon-options': IconOptions,
  },
})
export default class MobileNavbar extends Vue {
  @State navBarTitle!: string
  @State navBarOptions!: ListIcon[]
  @Mutation openAppBar!: () => void
}

</script>

<style scoped>

.navbar, .left, .right, .title {
  display: flex;
  align-items: center;
}

.navbar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
}

.relatives {
  position: relative;
  width: 100%;
}

.left {
  float: left;
  clear: left;
}

.nav-options {
  margin: 0 6px;
}

.right {
  position: absolute;
  right: 0;
  height: 100%;
}

.icon {
  height: 25px;
  width: 30px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: height .2s;
}

.line {
  height: 5px;
  width: 100%;
  border-radius: 2px;
  background-color: #8C8C8C;
  transition: background-color .3s;
}

.middle {
  width: 65%;
}

.icon:hover {
  height: 30px;
}

.icon:hover .line {
  background-color: #83B7E2;
}

.title {
  margin-left: 25px;
  color: #83B7E2;
  font-size: 1.5em;
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

</style>
