<template>
  <div class='list-el'>
    <div class='round-border visible' :class='[theme, {active: obj[content] === active}]'>
      <div class='content'>
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
    <transition name='fade'>
      <div v-if='showing && obj[sublist] && obj[sublist].length > 0' class='drop'>
        <link-render :sublist='sublist' :content='content' :active='active' :list='obj[sublist]'></link-render>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    'link-render': () => import('@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'),
    'icon': FontAwesomeIcon,
  },
})
export default class AppnavLink extends Vue {
  @State('theme') public readonly theme!: string
  @Prop({required: true}) public readonly obj!: any
  @Prop({required: true}) public readonly content!: string
  @Prop({required: true}) public readonly sublist!: string
  @Prop({required: true}) public readonly active!: string

  public showing: boolean = false
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
  padding: 6px 0;
  cursor: pointer;
  transition: background-color .3s;
}

.list-el .content {
  position: relative;
  display: flex;
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

.list-el .visible.light:hover, .list-el .visible.light.active {
  background-color: #E6E6E6;
}

.list-el .visible.dark:hover, .list-el .visible.dark.active {
  background-color: #282828;
}

</style>

