<template>
  <div :class='rootSelector'>
    <transition-group name='fade'>
      <empty-tag v-for='sort of list'
        :key='sort'
        :name='sort'

        :data-vid='sort'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import Mixin from '@/mixins/sortable'

import EmptyTag from './AppviewEmptytag.vue'

import Sortable from 'sortablejs'

@Component({
  components: {
    'empty-tag': EmptyTag,
  },
})
export default class AppviewEmptytag extends Mixins(Mixin) {
  @State theme!: string
  
  @Prop(Array) list!: string[]

  rootSelector: string = 'sort-list-sortable'

  mounted() {
    this.mount()
  }

  mount() {
    const sort = new Sortable(this.rootComponent, {
      disabled: false,
      group: 'appviewsortoptions',
      animation: 150,
      selectedClass: 'sortable-selected',
      dataIdAttr: 'data-sortableid',

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements('.' + this.rootSelector)
        console.log('update', ids)
        this.$emit('update', ids)
      },
    })
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>

<style scoped>

</style>
