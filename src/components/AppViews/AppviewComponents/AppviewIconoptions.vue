<template>
  <icon-dropdown
    :handle='handle'
    :size='lg'
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
          <dynamic-ft-icon
            class='txt'
            :icon='i.icon'
            :size='i.size'
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

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'icon-dropdown': IconDropdown,
  },
})
export default class AppviewIconoptions extends Vue {
  @Prop(String) handle!: string
  @Prop(String) size!: string
  @Prop(String) minWidth!: string
  @Prop(Array) options!: ListIcon[]

  optionClick(value: string, callback?: () => void) {
    if (callback)
      callback
    this.$emit('click', value)
  }
}

</script>

<style scoped src='@/assets/css/drop.css'>
</style>
