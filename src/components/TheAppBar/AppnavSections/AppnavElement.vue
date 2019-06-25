<template>
  <div class='list-el' :class='[platform, theme]'>
    <div
      class='round-border visible'
      @mouseenter='optionsOnHover = true'
      @mouseleave='optionsOnHover = false'
      @click="$emit('click', obj)"
    >
      <div
        class='content content-handle gray'
        ref='content'
        :class='contentClass'
      >
        <span v-if='obj.icon'
          class='left-icon'>
          <ft-icon-dynamic v-if='obj.iconColor'
            class='margin icon txt pointer'
            size='lg'
            :icon='obj.icon'
            :style="{color: obj.iconColor}"
          ></ft-icon-dynamic>
          <ft-icon-dynamic v-else
            class='margin icon txt pointer'
            size='lg'
            :icon='obj.icon'
          ></ft-icon-dynamic>
        </span>
        <span class='txt name'>{{ obj[contentObjPropertyName] }}</span>
      </div>
      <span class='icons'>
        <span v-for='i in icons'
          class='nav-icon'
          :key='i.icon'
        >
          <ft-icon-dynamic
            class='angle-right margin txt'
            :icon='i.icon'
            :size='i.size'
            :class='{sublist: showingSublists}'
          ></ft-icon-dynamic>
        </span>
        <span v-if='showAngleRightIcon'
          class='nav-icon'
          @click='showingSublists = !showingSublists'
        >
          <ft-icon-dynamic
            class='angle-right margin icon txt pointer'
            icon='angle-right'
            size='1x'
            :class='{sublist: showingSublists}'
          ></ft-icon-dynamic>
        </span>
        <transition name='fade'>
          <span v-if='showOptionsIcon' class='options-icon'>
            <icon-drop
              class='nav-icon'
              minwidth='150px'
              handle='ellipsis-v'
              :expand='true'
              :click='true'
            >
              <div class='dropdown round-border'>
                <div class='wrapper'>
                  <div v-for='i in options'
                    class='drop-el'
                    :key='i.name'
                    :class='theme'
                    @click='i.callback(obj)'
                  >
                    <span class='drop-icon'>
                      <ft-icon-dynamic
                        class='margin icon txt pointer'
                        :icon='i.icon'
                        :size='i.size'
                        :style="{color: i.color}"
                      ></ft-icon-dynamic>
                    </span>
                    <span class='drop-name txt'>{{ i.name }}</span>
                  </div>
                </div>
              </div>
            </icon-drop>
          </span>
        </transition>
        <transition name='fade'>
          <span v-if='!isSelectionEmpty' class='nav-icon handle'>
            <ft-icon-dynamic
              class='icon margin pointer txt'
              icon='grip-vertical'
              size='lg'
            ></ft-icon-dynamic>
          </span>
        </transition>
      </span>
    </div>
    <transition name='fade'>
      <div v-if='renderSublists' class='drop'>
        <list-render
          v-model='sublist'
          :sub-elements-property-name='subElementsPropertyName' :content-obj-property-name='contentObjPropertyName'
          :active-content='activeContent'
          :options='optionsrender'
          :icons='iconsrender'
          @update='update'
        ></list-render>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV, faAngleRight, faThumbtack, faDownload, faGripVertical } from '@fortawesome/free-solid-svg-icons'

library.add(faEllipsisV, faAngleRight, faThumbtack, faGripVertical)

import { ListIcon } from '@/interfaces/app'

@Component({
  components: {
    'icon-drop': IconDropdown,
    'ft-icon-dynamic': DynamicFontawesome,
    'list-render': () => import('@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'),
  },
})
export default class AppnavLink extends Vue {
  @Prop({required: true, type: Object}) obj!: any
  @Prop({required: true, type: String}) contentObjPropertyName!: string
  @Prop({required: true, type: String}) subElementsPropertyName!: string
  @Prop({required: true, type: String}) activeContent!: string
  @Prop(Array) icons!: ListIcon[]
  @Prop(Array) options!: ListIcon[]
  @Prop({default: () => [], type: Function}) iconsrender!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) optionsrender!: (obj: any) => ListIcon[]
  @Prop(Boolean) isSelectionEmpty!: boolean

  @State theme!: string
  @Getter isDesktop!: boolean
  @Getter platform!: string

  showingSublists: boolean = false
  optionsOnHover: boolean = false
  div: any = null
  direction: string | null = null
  sublist: any[] = this.obj[this.subElementsPropertyName]

  mounted() {
    this.div = this.$refs.content
  }

  update({arr}: any) {
    this.$emit('update', {arr, id: this.obj.id})
  }

  get contentClass() {
    return [
      this.theme,
      {active: this.obj[this.contentObjPropertyName] === this.activeContent},
    ]
  }
  get showAngleRightIcon() {
    return this.obj[this.subElementsPropertyName] && this.obj
    [this.subElementsPropertyName].length > 0
  }
  get showOptionsIcon() {
    return this.options && this.options.length > 0 && (!this.isDesktop
     || (this.isDesktop && this.optionsOnHover))
  }
  get renderSublists() {
    return this.showingSublists && this.obj[this.subElementsPropertyName]
     && this.obj[this.subElementsPropertyName].length > 0
  }
}

</script>

<style scoped>

.nav-icon, .list-el .content, .list-el .icons, .drop-el {
  display: flex;
  align-items: center;
}

.drop {
  margin-left: 10px;
}

.list-el {
  position: relative;
  margin-top: 2px;
}

.angle-right {
  transition: transform .3s;
}

.angle-right.sublist {
  transform: rotate(90deg);
}

.list-el .icons {
  position: absolute;
  top: 0;
  height: 100%;
  right: 8px;
}

.nav-icon {
  justify-content: center;
  height: 100%;
  width: 20px;
  cursor: pointer;
  z-index: 1;
}

.options-icon {
  z-index: 2;
}

.nav-icon:hover > .icon.svg-inline--fa, .nav-icon:hover .handle.svg-inline--fa {
  color: #fc7d7d !important;
}

.list-el .visible {
  position: relative;
  cursor: pointer;
  height: 35px;
}

.list-el .content {
  position: relative;
  right: 0px;
  height: 100%;
  width: 100%;
  border-radius: 10px;
  transition: background-color .3s;
}

.list-el .left-icon {
  text-align: center;
  width: 30px;
}

.list-el .name {
  margin-left: 6px;
}

.list-el .content.light:hover, .list-el .content.light.active, .sortable-selected.light .content {
  background-color: #E6E6E6 !important;
}

.list-el .content.dark:hover, .list-el .content.dark.active,  .sortable-selected.dark .content {
  background-color: #282828 !important;
}

.dropdown {
  overflow: hidden;
}

.drop-el {
  height: 35px;
  width: 100%;
  transition: background-color .3s;
}

.drop-icon {
  width: 39px;
  text-align: center;
}

.drop-name {
  white-space: nowrap;
  margin-right: 12px;
}

.drop-el.light:hover {
  background-color: #E6E6E6;
}

.drop-el.dark:hover {
  background-color: #282828;
}

</style>

