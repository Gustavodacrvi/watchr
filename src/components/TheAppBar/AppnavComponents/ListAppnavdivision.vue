<template>
  <div :class='`sort-appnavdivision-${this.group}`'>
    <transition-group name='fade'>
      <app-division v-for='el of list' :key='el.id'
        :name='el.name'
        :list='true'
        :icons='icons'
        :icons-payload='el.id'

        :data-vid='el.id'
      >
        asdf
      </app-division>
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import Mixin from '@/mixins/sortable'

import Sortable from 'sortablejs'

import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'

import { ListIcon, AppnavDivisionEl } from '../../../interfaces/app'
import { IndexGetters } from '../../../interfaces/store/index'

@Component({
  components: {
    'app-division': AppnavDivision,
  },
})
export default class ListRenderer extends Mixins(Mixin) {
  @Getter isDesktop!: IndexGetters.IsDesktop

  @Prop(Array) icons!: ListIcon[]
  @Prop({required: true, type: Array}) list!: AppnavDivisionEl[]
  @Prop({required: true, type: String}) group!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) helpIcons!: (obj: any) => ListIcon[]

  sortable: any = null
  rootSelector: string = `.sort-appnavdivision-${this.group}`

  mounted() {
    this.mount()
  }

  mount() {
    const options: any = {
      disabled: this.disabled,
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: false,
      dataIdAttr: 'data-sortableid',
      group: this.group,

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector)
        this.$emit('update', ids)
      },
    }

    if (!this.isDesktop)
      options['handle'] = '.handle'

    this.sortable = new Sortable(this.rootComponent, options)
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
