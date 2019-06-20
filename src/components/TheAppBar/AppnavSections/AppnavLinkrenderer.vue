<template>
  <div>
    <draggable v-model='arr' :animation='300' @end='onEnd'>
      <div class='list-el' v-for='el in arr' :key='el.id'>
        <div class='round-border visible' :class='[theme, {active: el[content] === active}]'>
          <div class='content'>
            <span class='txt name'>{{ el[content] }}</span>
            <span class='icons'>
              <icon v-if='el[sublists].length > 0' icon='angle-right' :class='{showing: showing}' size='1x' @click='showing = !showing'></icon>
            </span>
          </div>
        </div>
        <transition name='fade'>
          <div v-if='showing' class='drop'>
            <link-render v-if='el[sublists].length > 0' :list='el[sublists]' :content='content' :active='active' :sublists='sublists'></link-render>
          </div>
        </transition>
      </div>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  name: 'link-render',
  components: {
    draggable: Draggable,
    icon: FontAwesomeIcon,
  },
})
export default class AppnavLinkrenderer extends Vue {
  @State('theme') public readonly theme!: string
  @Prop({required: true}) public readonly list!: any[]
  @Prop({required: true}) public readonly content!: string
  @Prop({required: true}) public readonly active!: string
  @Prop() public readonly sublists!: any[]

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

<style scoped>

.angle-right {
  transition: transform .3s;
}

.angle-right.showing {
  transform: rotate(90deg);
}

.drop {
  margin-left: 12px;
}

</style>


<style scoped src='@/assets/css/appBarSection.css'>
</style>
