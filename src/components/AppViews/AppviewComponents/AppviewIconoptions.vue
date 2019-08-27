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
      <div v-if='isDesktop' class='drop round-border scroll' :class='theme'>
        <div v-for='i in options'
          class='el cancel-sortable-unselect txt-light'
          :key='i.name'
          @click='optionClick(i.name, i.callback)'
        >
          <span class='el-icon'>
            <i v-if='!i.iconColor' :class='`txt fas fa-${i.icon} txt-light fa-${i.size}`'></i>
            <i v-else :class='`txt fas fa-${i.icon} txt-light fa-${i.size}`' :style='{color: i.iconColor}'></i>
          </span>
          <span class='el-name txt txt-light'>
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
import { IndexState, IndexMutations, IndexGetters } from '../../../interfaces/store/index'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class AppviewIconoptions extends Vue {
  @State theme!: IndexState.theme
  @State('centeredCard') card!: IndexState.centeredCard
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

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
