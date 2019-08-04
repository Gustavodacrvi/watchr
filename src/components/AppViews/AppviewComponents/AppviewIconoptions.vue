<template>
  <span class='icon-options'>
    <icon-dropdown
      :handle='handle'
      :size='size'
      :change-color-on-hover='true'
      :min-width='minWidth'
      @click='pushIcons'
      :float-top='floatTop'
      :centralize='centralize'
    >
      <div v-if='isDesktop' class='drop round-border'>
        <div v-for='i in options'
          class='el cancel-sortable-unselect'
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
  </span>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, Getter } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

import { ListIcon } from '../../../interfaces/app'
import { CenteredCard } from '../../../store'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class AppviewIconoptions extends Vue {
  @State theme!: string
  @State('centeredCard') card!: CenteredCard | null
  @Getter isDesktop!: boolean
  @Mutation pushCenteredCard!: (card: CenteredCard | null) => void

  @Prop(String) handle!: string
  @Prop(String) size!: string
  @Prop(String) minWidth!: string
  @Prop(Boolean) floatTop!: boolean
  @Prop(Boolean) centralize!: boolean
  @Prop(Array) options!: ListIcon[]
  @Prop() payload!: any

  pushIcons() {
    if (!this.isDesktop)
      this.pushCenteredCard({
        listIcons: this.options,
        type: 'ListIcons',
        flexBasis: '250px',
        compName: '',
        listIconHandler: (name: string, callback: () => void) => this.optionClick(name, callback),
      })
  }
  optionClick(value: string, callback?: (payload: any) => void) {
    this.$emit('click', value)
    if (callback)
      callback(this.payload)
  }
}

</script>

<style scoped src='@/assets/css/drop.css'>
</style>
