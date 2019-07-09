<template>
  <div class='component'>
    <div class='header'>
      <dynamic-ft-icon
        :icon='pers.icon'
        :style='{color: pers.iconColor}'
        size='2x'
      />
      <span class='title'>
        {{ pers.name }}
      </span>
      <div class='right'>
        <drop-finder
          class='icon pointer txt'
          handle='search'
          size='lg'
          min-width='300px'
          v-model='search'
        />
      </div>
    </div>
    <div class='margin'></div>
    <p class='description txt'>
      {{ pers.description }}
    </p>
    <div class='margin'></div>
    <view-tags
      :is-default-perspective='isDefaultPerspective'
      :search='search'
      @clearsearch="v => search = ''"
    />
    <div class='margin'></div>
    <task-renderer
      :tasks='getTasks'
    />
    <task-adder
      v-bind='fixedTags'
      :allow-priority='true'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'
import TaskAdder from '@/components/AppViews/AppviewComponents/AppviewTaskAdder.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/AppviewTaskrenderer.vue'

import { SmartPerspective, Label, Task } from '../../interfaces/app'

const labelVuex = namespace('label')
const taskVuex = namespace('task')

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

library.add(faSearch)

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
    'task-adder': TaskAdder,
    'task-renderer': AppviewTaskrenderer,
  },
})
export default class PerspectiveAppview extends Vue {
  @State('perspectiveData') pers!: SmartPerspective
  @Getter isDesktop!: boolean
  @Getter isDefaultPerspective!: boolean

  @taskVuex.State tasks!: Task[]

  search: string = ''

  @labelVuex.Getter sortedLabels!: Label[]
  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  get fixedTags() {
    if (this.isDefaultPerspective && this.pers)
      return {
        ['fixed-tag']: this.pers.name,
      }
  }
  get getTasks() {
    if (this.pers && this.isDefaultPerspective && this.pers.name === 'Inbox')
      return this.tasks.filter(el => el.labels.length === 0)
  }
}

</script>

<style scoped>

.margin {
  height: 30px;
}

.component {
  padding-top: 20px;
}

.header {
  position: relative;
}

.right {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.title {
  font-size: 1.5em;
  margin-left: 12px;
  color: #FF6B66;
}

</style>
