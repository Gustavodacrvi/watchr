<template>
  <div>
    <div class='margin'></div>
    <div class='header'>
      <span class='name txt'>{{ name }}</span>
      <span class='icons'>
        <span
          class='nav-icon'
        >
          <icon-drop
            class='nav-icon'
            minwidth='150px'
            handle='ellipsis-v'
            :expand='true'
            :click='true'
          >
            <div class='dropdown round-border'>
              <div class='wrapper'>
                <div v-for='i in options'
                  class='drop-el'
                  :key='i.name'
                  :class='theme'
                  @click='i.callback(obj)'
                >
                  <span class='drop-icon'>
                    <ft-icon-dynamic
                      class='margin icon txt pointer'
                      :icon='i.icon'
                      :size='i.size'
                      :style='{color: i.iconColor}'
                    ></ft-icon-dynamic>
                  </span>
                  <span class='drop-name txt'>{{ i.name }}</span>
                </div>
              </div>
            </div>
          </icon-drop>
        </span>
        <span
          class='nav-icon'
          @click='showing = !showing'
        >
          <ft-icon
            class='icon txt pointer'
            icon='angle-right'
            size='1x'
            :class='{showing: showing}'
          ></ft-icon>
        </span>
      </span>
    </div>
    <div class='margin'></div>
    <transition name='fade'>
      <div v-if='showing'
        class='content'
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import IconDropdown from '@/components/IconDropdown.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleRight, faEllipsisH } from '@fortawesome/free-solid-svg-icons'

library.add(faAngleRight, faEllipsisH)

@Component({
  components: {
    'icon-drop': IconDropdown,
  },
})
export default class AppnavDivision extends Vue {
  @Prop({type: String, required: true}) name!: string
  @Prop({type: Array}) options!: string

  showing: boolean = true
}

</script>

<style scoped>

.margin {
  height: 12px;
}

.icon {
  transition: transform .3s;
}

.icon.showing {
  transform: rotate(90deg);
}

.header {
  display: flex;
  height: 20px;
  justify-content: space-between;
  align-items: center;
}

.icons {
  display: flex;
}

.nav-icon {
  width: 25px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-icon:hover .icon {
  color: #fc7d7d;
}

.header .name {
  margin-left: -5px;
  font-size: .8em;
}

</style>

<style scoped src='@/assets/css/appLists.css'>
</style>
