<template>
  <div>
    <draggable v-model='arr' :animation='300' @end='onEnd'>
      <div>
        <span class='round-border list-el' v-for='el in arr' :class='[theme, {active: el[content] === active}]' :key='el.id'>
          <span class='txt name'>{{ lab[content] }}</span>
        </span>
        <div v-if='subLists'>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import Draggable from 'vuedraggable'

@Component({
  name: 'link-render',
  components: {
    draggable: Draggable,
  },
})
export default class AppnavLinkrenderer extends Vue {
  @Prop({required: true}) public readonly list!: any[]
  @Prop({required: true}) public readonly content!: string
  @Prop({required: true}) public readonly active!: string
  @Prop() public readonly subLists!: any[]

  public arr: any[] = this.list
  public showing: boolean = false

  public created(): void {

  }

  @Watch('list')
  public onChange(): void {
    this.arr = this.list
  }

  public onEnd(): void {

  }
}

</script>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
