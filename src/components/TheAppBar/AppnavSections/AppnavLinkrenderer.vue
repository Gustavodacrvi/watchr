<template>
  <div>
    <draggable v-model='arr' :animation='300' @end='onEnd' :sort='sort'>
      <appnav-link v-for='el in arr' :key='el.id' :obj='el' :content='content' :sublist='sublist' :active='active'></appnav-link>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    'draggable': Draggable,
    'icon': FontAwesomeIcon,
    'appnav-link': () => import('@/components/TheAppBar/AppnavSections/AppnavLink.vue'),
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true}) public readonly list!: any[]
  @Prop({required: true}) public readonly content!: string
  @Prop({default: ''}) public readonly active!: string
  @Prop({default: ''}) public readonly sublist!: string
  @Prop({default: true}) public readonly sort!: boolean

  public arr: any[] = this.list

  @Watch('list')
  public onChange(): void {
    this.arr = this.list
  }

  public onEnd(): void {

  }
}

</script>
