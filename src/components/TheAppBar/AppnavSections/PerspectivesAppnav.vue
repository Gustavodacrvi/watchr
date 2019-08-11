<template>
  <div>
    <appnav-header
      name='PERSPECTIVES'
      :show-title='selected.length === 0'
      :icons='getHeaderOptions'
    />
    <appnav-division name='SMART PERSPECTIVES'>
      <list-renderer
        group='appnavperspectives'
        route='pers'
        :list='smartPers'
        :options='getOptions'
        :help-icons='helpIcons'
        :active='activePers'
        @update='onUpdate'
        @selected='select'
      />
    </appnav-division>
    <appnav-division
      name='CUSTOM PERSPECTIVES'
      :icons='getDivisionIcons'
    >
      <list-renderer key='list' v-if='sortedCustomPerspectives && sortedCustomPerspectives.length > 0'
        group='appnavcustomperspectives'
        route='pers'
        :list='customPers'
        :options='getOptionsCustom'
        :help-icons='helpIconsCustom'
        :active='activePers'
        @update='onCustomUpdate'
        @selected='selectCustom'
      />
      <appnav-message key='msg' v-else @click="pushPopUp('PerspectiveAdderPopup')" name='Add custom perspective'/>
    </appnav-division>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, namespace, Getter, Mutation } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'

import { Label, Perspective, ListIcon, SimpleAdder, ListElement, Task } from '@/interfaces/app'

const persVuex = namespace('perspective')
const taskVuex = namespace('task')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
    'appnav-division': AppnavDivision,
    'appnav-message': AppnavMessage,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: string
  @State viewType!: string
  @Mutation pushPopUp!: (comp: string) => void
  @Mutation pushPopUpPayload!: (obj: SimpleAdder | any) => void
  @Mutation openSection!: (section: string) => void
  @Getter initialAppViewRoute!: string

  @persVuex.State smartOrder!: Perspective[]
  @persVuex.Getter sortedSmartPerspectives!: Perspective[]
  @persVuex.Getter sortedCustomPerspectives!: Perspective[]
  @persVuex.Getter initialPerspective!: string
  @persVuex.Getter getNumberOfTasksByPerspectiveId!: (id: string, tasks: Task[]) => number
  @persVuex.Getter getPerspectiveById!: (id: string) => Perspective
  @persVuex.Action saveSmartOrder!: (ids: string[]) => void
  @persVuex.Action saveCustomOrder!: (ids: string[]) => void
  @persVuex.Action togglePerspectivesPin!: (obj: Array<{id: string, pin?: boolean}>) => void
  @persVuex.Action togglePerspectivesNumberOfTasks!: (obj: Array<{id: string, show?: boolean}>) => void
  @persVuex.Action togglePerspectivesShowWhenNotEmpty!: (obj: Array<{id: string, show?: boolean}>) => void
  @persVuex.Action deletePerspectivesById!: (ids: string[]) => void

  @taskVuex.State tasks!: Task[]

  @Prop(String) search!: string

  selected: string[] = []
  selectedType: 'custom' | 'smart' = 'custom'

  created() {
    this.openSection('labels')
  }

  select(selected: string[]) {
    this.selectedType = 'smart'
    this.selected = selected
  }
  selectCustom(selected: string[]) {
    this.selectedType = 'custom'
    this.selected = selected
  }
  onUpdate(ids: string[]) {
    this.saveSmartOrder(ids)
  }
  onCustomUpdate(ids: string[]) {
    this.saveCustomOrder(ids)
  }
  getOptionsCustom(per: Perspective) {
    const icons: ListIcon[] = [
      {
        name: 'Pin perspective',
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesPin([{id}])
        },
      },
      {
        name: 'Show number of tasks',
        icon: 'eye',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesNumberOfTasks([{id}])
        },
      },
      {
        name: 'Only show when not empty',
        icon: 'exclamation',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesShowWhenNotEmpty([{id}])
        },
      },
      {
        name: 'Edit perspective',
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.pushPopUp('PerspectiveAdderPopup')
          this.pushPopUpPayload(this.getPerspectiveById(id))
        },
      },
      {
        name: 'Delete perspective',
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.deletePerspectivesById([id])
          const pers = this.getPerspectiveById(id)
          if (pers && pers.name === this.viewName)
            this.$router.replace('/user?pers=' + this.initialPerspective)
        },
      },
    ]
    if (per.pin)
      icons[0].name = 'Unpin perspective'
    if (per.numberOfTasks) {
      icons[1].name = 'Hide number of tasks'
      icons[1].icon = 'eye-slash'
    }
    if (per.showWhenNotEmpty)
      icons[2].name = 'Always show perspective'
    return icons
  }
  helpIconsCustom(per: Perspective) {
    const icons: ListIcon[] = []
    if (per.pin)
      icons.push({
        icon: 'thumbtack',
        iconColor: '',
        name: '',
        size: 'xs',
      })
    if (per.numberOfTasks)
      icons.push({
        icon: 'eye',
        iconColor: '',
        name: '',
        size: 'sx',
      })
    if (per.showWhenNotEmpty)
      icons.push({
        icon: 'exclamation',
        iconColor: '',
        name: '',
        size: 'sx',
      })
    return icons
  }
  getOptions(per: Perspective) {
    const icons: ListIcon[] = [
      {
        name: 'Pin perspective',
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesPin([{id}])
        },
      },
      {
        name: 'Show number of tasks',
        icon: 'eye',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesNumberOfTasks([{id}])
        },
      },
      {
        name: 'Only show when not empty',
        icon: 'exclamation',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivesShowWhenNotEmpty([{id}])
        },
      },
      {
        name: 'Edit smart perspective',
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.pushPopUp('EditSmartPerspectivePopup')
          this.pushPopUpPayload(this.getPerspectiveById(id))
        },
      },
    ]
    if (per.pin)
      icons[0].name = 'Unpin perspective'
    if (per.numberOfTasks) {
      icons[1].name = 'Hide number of tasks'
      icons[1].icon = 'eye-slash'
    }
    if (per.showWhenNotEmpty)
      icons[2].name = 'Always show perspective'
    return icons
  }
  helpIcons(per: Perspective) {
    const icons: ListIcon[] = []
    if (per.pin)
      icons.push({
        icon: 'thumbtack',
        iconColor: '',
        name: '',
        size: 'xs',
      })
    return icons
  }

  get smartPers(): ListElement[] {
      const els: ListElement[] = []
      const pers = this.sortedSmartPerspectives.filter(el => el.name.includes(this.search))
      for (const per of pers) {
        let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks)
        const show = true
        if (!per.numberOfTasks)
          numberOfTasks = 0
        els.push({
          ...per, show, number: numberOfTasks,
        })
      }
      return els
    }
  get customPers(): ListElement[] {
    const els: ListElement[] = []
    const pers = this.sortedCustomPerspectives.filter(el => el.name.includes(this.search))
    for (const per of pers) {
      let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks)
      const show = true
      if (!per.numberOfTasks)
        numberOfTasks = 0
      els.push({
        ...per, show, number: numberOfTasks,
      })
    }
    return els
  }
  get activePers(): string {
    if (this.viewType === 'perspective')
      return this.viewName
    return ''
  }
  get getHeaderOptions(): ListIcon[] {
    if (this.selectedType === 'smart')
      return [
        {
          name: '',
          icon: 'thumbtack',
          iconColor: '',
          size: 'lg',
          callback: () => {
            const arr: any = []
            for (const el of this.selected)
              arr.push({id: el})
            this.togglePerspectivesPin(arr)
          },
        },
      ]
    else return [
      {
        name: '',
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: () => {
          const arr: any = []
          for (const el of this.selected)
            arr.push({id: el})
          this.togglePerspectivesPin(arr)
        },
      },
      {
        name: 'f',
        icon: 'eye',
        iconColor: '',
        size: 'lg',
        callback: () => {
          const arr: any = []
          for (const el of this.selected)
            arr.push({id: el})
          this.togglePerspectivesNumberOfTasks(arr)
        },
      },
      {
        name: 'd',
        icon: 'exclamation',
        iconColor: '',
        size: 'lg',
        callback: () => {
          const arr: any = []
          for (const el of this.selected)
            arr.push({id: el})
          this.togglePerspectivesShowWhenNotEmpty(arr)
        },
      },
      {
        name: 'k',
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        callback: () => {
          for (const id of this.selected)
            if (this.getPerspectiveById(id).name === this.activePers) {
              this.$router.push('/user?pers=' + this.initialPerspective)
              break
            }
          this.deletePerspectivesById(this.selected)
        },
      },
    ]
  }
  get getDivisionIcons(): ListIcon[] {
    return [
      {
        name: 'asdf',
        icon: 'plus',
        iconColor: '',
        size: 'lg',
        callback: () => {
          this.pushPopUp('PerspectiveAdderPopup')
        },
      },
    ]
  }
}

</script>

<style scoped>

</style>
