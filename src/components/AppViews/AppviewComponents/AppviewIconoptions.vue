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
          <dynamic-ft-icon v-if='!i.iconColor'
            class='txt'
            :icon='i.icon'
            :size='i.size'
          />
          <dynamic-ft-icon v-else
            class='txt'
            :icon='i.icon'
            :size='i.size'
            :style='{color: i.iconColor}'
          />
        </span>
        <span class='el-name txt'>
          {{ i.name }}
        </span>
      </div>
    </div>
  </icon-dropdown>  
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { ListIcon } from '../../../interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'

library.add(faExclamation)

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
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
      callback
  }
}

</script>

<style scoped src='@/assets/css/drop.css'>
</style>
