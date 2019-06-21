<template>
  <div class='list-el'>
    <v-touch @panmove='panmove'>
      <div class='round-border visible'>
        <div class='back'>
        </div>
        <div class='content gray' ref='content' :class='[theme, {active: obj[content] === active}]'>
          <span class='left-icon' v-if='obj.icon'>
            <icon v-if='obj.iconColor' :icon='obj.icon' :color='obj.iconColor'></icon>
            <icon v-else :icon='obj.icon'></icon>
          </span>
          <span class='txt name'>{{ obj[content] }}</span>
          <span class='icons'>
            <icon v-if='obj[sublist] && obj[sublist].length > 0' icon='angle-right' :class='{showing: showing}' size='1x' @click='showing = !showing'></icon>
          </span>
        </div>
      </div>
    </v-touch>
    <transition name='fade'>
      <div v-if='showing && obj[sublist] && obj[sublist].length > 0' class='drop'>
        <link-render :sublist='sublist' :content='content' :active='active' :list='obj[sublist]' @update='update'></link-render>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

import VueTouch from 'vue-touch'
Vue.use(VueTouch, {name: 'v-touch'})

@Component({
  components: {
    'link-render': () => import('@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'),
    'icon': FontAwesomeIcon,
  },
})
export default class AppnavLink extends Vue {
  @State('theme') public readonly theme!: string
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Prop({required: true}) public readonly obj!: any
  @Prop({required: true}) public readonly content!: string
  @Prop({required: true}) public readonly sublist!: string
  @Prop({required: true}) public readonly active!: string

  public showing: boolean = false

  public update({arr}: any): void {
    this.$emit('update', {arr, id: this.obj.id})
  }

  public panmove(e: any): void {
    
  }
}

</script>

<style scoped>

.drop {
  margin-left: 10px;
}

.list-el {
  position: relative;
  margin-top: 2px;
}

.list-el .visible {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  height: 30px;
}

.list-el .back {
  position: absolute;
  height: 93%;
  width: 99%;
  border-radius: 10px;
  left: 1px;
  bottom: 1px;
  background-color: #AF92F7;
  z-index: 1;
}

.list-el .content {
  position: relative;
  display: flex;
  z-index: 2;
  right: 0px;
  align-items: center;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  transition: background-color .3s, right .1s;
}

.list-el .left-icon {
  text-align: center;
  width: 30px;
}

.list-el .name {
  margin-left: 6px;
}

.list-el .icons {
  position: absolute;
  height: 100%;
  right: 8px;
  display: flex;
  align-items: center;
}

.list-el .content.light:hover, .list-el .content.light.active {
  background-color: #E6E6E6;
}

.list-el .content.dark:hover, .list-el .content.dark.active {
  background-color: #282828;
}

</style>

