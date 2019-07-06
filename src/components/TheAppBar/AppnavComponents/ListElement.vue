<template>
  <div class='element round-border' :class='theme'>
    <div class='left-icon'>
    </div>
    <div class='content'>
      <span class='txt name'>{{ name }}</span>
    </div>
    <div v-if='options && options.length > 0'
      class='options'
    >
      <icon-dropdown
        handle='ellipsis-v'
        size='lg'
        :change-color-on-hover='true'
        min-width='200px'
      >
        <div class='drop'>
          <div v-for='i in options'
            class='el round-border'
            :key='i.name'
            :class='theme'
            @click='i.callback'
          >
            <span class='el-icon'>
              <dynamic-ft-icon
                class='txt'
                :icon='i.icon'
                :size='i.size'
              />
            </span>
            <span class='el-name txt'>
              {{ i.name }}
            </span>
          </div>
        </div>
      </icon-dropdown>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import FontAwesome from '@/components/DynamicFontawesome.vue'
import IconDropdown from '@/components/IconDropdown.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'

library.add(faEllipsisV)

import { List, ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
    'icon-dropdown': IconDropdown,
  },
})
export default class ListRenderer extends Vue {
  @State theme!: string
  @Prop(String) name!: string
  @Prop(Array) options!: ListIcon[]

  showing: boolean = true
}

</script>

<style scoped>

.element {
  position: relative;
  display: flex;
  height: 33px;
  cursor: pointer;
  transition: background-color .25s;
}

.content {
  height: 100%;
  flex-basis: 100%;
  display: flex;
  align-items: center;
}

.name {
  margin-left: 12px;
}

.options {
  flex-basis: 30px;
  height: 100%;
}

.icon-dropdown {
  display: flex;
  justify-content: center;
  align-items: center;
}

.element.dark:hover, .sortable-selected.dark {
  background-color: #282828;
}

.element.light:hover, .sortable-selected.light {
  background-color: #E6E6E6;
}

.sortable-selected {
  background-color: red;
}



.drop {
  z-index: 5;
  overflow: hidden;
}

.el {
  transition: background-color .25s;
  height: 35px;
  display: flex;
}

.el.dark:hover {
  background-color: #282828;
}

.el.light:hover {
  background-color: #E6E6E6;
}

.el-icon {
  height: 100%;
  flex-basis: 33px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-name {
  flex-basis: 100%;
  display: flex;
  align-items: center;
}

</style>
