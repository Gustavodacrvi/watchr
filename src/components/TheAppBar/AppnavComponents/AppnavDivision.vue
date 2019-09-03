<template>
  <div class='division'>
    <div class='header division-handle' @click='showing = !showing' @mouseenter='onHover = true' @mouseleave='onHover = false'>
      <span class='txt' :class='theme'>{{ name }}</span>
      <span class='right' @click.stop='showing = !showing'>
        <template v-if='!list'>
          <span v-for='i in icons'
            :key='i.name'
            class='header-option transparent'
            @click.stop='i.callback'
          >
            <i :class='[`fas pointer icon fa-${i.icon} fa-${i.size} txt`, theme]'></i>
          </span>
        </template>
        <div v-else-if='icons && icons.length > 0' style='margin-right: 10px;'>
          <transition name='fade'>
            <icon-options v-if='onHover'
              handle='ellipsis-v'
              size='lg'
              minWidth='200px'
              :options='icons'
              :payload='iconsPayload'
            />
          </transition>
        </div>
        <span class='header-option transparent'>
          <i class='fas pointer icon fa-angle-down fa-lg txt' :class='[{rotate: showing}, theme]'></i>
        </span>
      </span>
    </div>
    <transition name='fade'>
      <div v-if='showing' style='min-height: 33px;'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ListIcon } from '../../../interfaces/app'
import { IndexState } from '../../../interfaces/store/index'

import IconOptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'

@Component({
  components: {
    'icon-options': IconOptions,
  },
})
export default class TodayView extends Vue {
  @State theme!: IndexState.theme

  @Prop(String) name!: string
  @Prop(Boolean) list!: boolean
  @Prop(Array) icons!: ListIcon[]
  @Prop() iconsPayload!: any

  showing: boolean = true
  onHover: boolean = false
}

</script>

<style scoped>

.header-option {
  margin-right: 8px;
}

.transparent {
  opacity: .6;
}

.header {
  height: 20px;
  display: flex;
  align-items: center;
  margin-left: -12px;
  font-size: .9em;
  margin: 10px 0;
  position: relative;
}

.fas {
  transition: transform .3s;
}

.rotate {
  transform: rotate(-90deg);
}

.right {
  position: absolute;
  right: 0;
  display: flex;
}

</style>
