<template>
  <div :class="`headings-renderer headings-renderer-${id}`">
    <transition-group name="fade">
      <app-header v-for='(head, index) in headings'
        :key='head.id'
        :payload='head.id'
        :obj='{name: head.name}'
        :options='headerOptions'
        :allow-edit='true'

        :data-vid='head.id'

        @enter='saveHeadingName'
      >
        <task-renderer
          class='task-renderer'
          list-type='projectHeading'
          :id='head.id'
          :tasks='head.tasks'
          :parent-id='head.id'
          :default-priority='defaultPriority'
          :default-labels='defaultLabels'
          :allow-priority='allowPriority'
          :allow-project='allowProject'
          :fix-adder-position='fixAdderPosition'
          :insert-before='insertBefore'
          :always-show-last-edit-date='alwaysShowLastEditDate'
          :always-show-creation-date='alwaysShowCreationDate'
          :always-show-task-labels='alwaysShowTaskLabels'
          :allow-labels='allowLabels'
          :default-project='defaultProject'
          :is-on-project='isOnProject'
          :allow-date='allowDate'
          :emit-on-delete='emitOnDelete'
          :number='index + 1'
          :show-project-name='false'
          @selected='onSelect'
          @delete='deleteTask'
          @add='addTask'
          @update='updateHeadingTasks'
          @addheading='addHeading'

          @fromroot='fromroot'
          @toroot='toroot'
          @betweenheadings='betweenheadings'
        />
      </app-header>
    </transition-group>
    <div class="margin"></div>
  </div>
</template>

<script lang='ts'>

import Sortable from 'sortablejs'

import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'

import Mixin from '@/mixins/sortable'

import AppviewHeader from '@/components/AppViews/AppviewComponents/Headings/AppviewHeading.vue'
import AppviewTaskrenderer from '@/components/AppViews/AppviewComponents/Tasks/AppviewTaskrenderer.vue'

import { Heading, Label, ListIcon, Project } from '../../../../interfaces/app'

@Component({
  components: {
    'app-header': AppviewHeader,
    'task-renderer': AppviewTaskrenderer,
  },
})
export default class HeadingsRenderer extends Mixins(Mixin) {
  @Prop(Array) headings!: Heading[]
  @Prop(Array) headerOptions!: ListIcon[]
  @Prop(String) defaultPriority!: string
  @Prop(String) id!: string
  @Prop(Array) defaultLabels!: Label[]
  @Prop(Object) defaultProject!: Project
  @Prop(Boolean) allowPriority!: boolean
  @Prop(Boolean) isOnProject!: boolean
  @Prop(Boolean) allowProject!: boolean
  @Prop(Boolean) allowLabels!: boolean
  @Prop(Boolean) allowDate!: boolean
  @Prop(Boolean) disabled!: boolean
  @Prop(Boolean) emitOnDelete!: boolean
  @Prop(Boolean) fixAdderPosition!: boolean
  @Prop(Boolean) insertBefore!: boolean
  @Prop(Boolean) alwaysShowLastEditDate!: boolean
  @Prop(Boolean) alwaysShowCreationDate!: boolean
  @Prop(Boolean) alwaysShowTaskLabels!: boolean

  sortable: any = null
  rootSelector: string = `.headings-renderer-${this.id}`

  mounted() {
    this.mount()
  }

  mount() {
    const options: any = {
      disabled: this.disabled,
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: false,
      handle: '.heading-handle',
      dataIdAttr: 'data-sortableid',
      group: this.id,

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector, 'task-renderer')
        this.$emit('updateheadings', ids)
      },
    }

    this.sortable = new Sortable(this.rootComponent, options)
  }

  fromroot(obj: any) {
    this.$emit('fromroot', obj)
  }
  addHeading(obj: any) {
    this.$emit('addheading', obj)
  }
  toroot(obj: any) {
    this.$emit('toroot', obj)
  }
  betweenheadings(obj: any) {
    this.$emit('betweenheadings', obj)
  }
  saveHeadingName({name, payload}: {name: string, payload: string}) {
    this.$emit('saveheading', {name, headingId: payload})
  }
  onSelect(ids: string[]) {
    this.$emit('selected', ids)
  }
  updateHeadingTasks(obj: {ids: string[], parentId: string}) {
    this.$emit('update', obj)
  }
  addTask(obj: any) {
    this.$emit('add', obj)
  }
  deleteTask(obj: any) {
    this.$emit('delete', obj)
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
