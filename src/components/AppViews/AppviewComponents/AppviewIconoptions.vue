<template>
  <icon-dropdown
    :handle='handle'
    :size='size'
    :change-color-on-hover='true'
    :min-width='minWidth'
  >
    <div class='drop round-border'>
      <div v-for='i in options'
        class='el'
        :key='i.name'
        :class='theme'
        @click='optionClick(i.name, i.callback)'
      >
        <span class='el-icon'>
          <i v-if='!i.iconColor' :class='[`txt fas fa-${i.icon} fa-${i.size}`, theme]'></i>
          <i v-else :class='[`txt fas fa-${i.icon} fa-${i.size}`, theme]' :style='{color: i.iconColor}'></i>
        </span>
        <span class='el-name txt' :class='theme'>
          {{ i.name }}
        </span>
      </div>
    </div>
  </icon-dropdown>  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class AppviewIconoptions extends Vue {
  @State theme!: string

  @Prop(String) handle!: string
  @Prop(String) size!: string
  @Prop(String) minWidth!: string
  @Prop(Array) options!: ListIcon[]

  optionClick(value: string, callback?: () => void) {
    this.$emit('click', value)
    if (callback)
      callback()
  }
}

</script>

<style scoped src='@/assets/css/drop.css'>
</style>
