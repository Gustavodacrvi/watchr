<template>
  <div class='element round-border' :class='theme'>
    <div class='left-icon'>
    </div>
    <div class='content'>
      <span class='txt name'>{{ name }}</span>
    </div>
    <div class='options'>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import FontAwesome from '@/components/DynamicFontawesome.vue'
import { List } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
    'list-render': () => import('@/components/TheAppBar/AppnavComponents/ListRenderer.vue'),
  },
})
export default class ListRenderer extends Vue {
  @State theme!: string
  @Prop(String) name!: string

  showing: boolean = true
}

</script>

<style scoped>

.element {
  position: relative;
  display: flex;
  height: 35px;
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

.element.dark:hover, .sortable-selected.dark {
  background-color: #282828;
}

.element.light:hover, .sortable-selected.light {
  background-color: #E6E6E6;
}

.sortable-selected {
  background-color: red;
}

</style>
