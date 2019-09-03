<template>
  <div>
    <appnav-header
      name='PROJECTS'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <appnav-renderer v-if='sortedFolders && sortedFolders.length > 0'
      group='appnavdivision'
      :list='getFoldersList'
      :icons='folderOptions'
    />
    <appnav-message v-else @click='pushPopUp("AddFolderPopup")' name='Add folder'/>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import AppnavRenderer from '@/components/TheAppBar/AppnavComponents/ListAppnavdivision.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'
import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'

import { Label, Perspective, Task, ListIcon, ListElement, AppnavDivisionEl } from '@/interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState } from '../../../interfaces/store/task'
import { SetState } from '../../../interfaces/store/settings'
import { ProjectGetters } from '../../../interfaces/store/project'

const set = namespace('settings')
const project = namespace('project')

@Component({
  components: {
    'appnav-renderer': AppnavRenderer,
    'appnav-header': AppnavHeader,
    'appnav-message': AppnavMessage,
    'app-division': AppnavDivision,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: IndexState.viewName
  @State viewType!: IndexState.viewType
  @Mutation openSection!: IndexMutations.OpenSection
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  @project.Getter sortedFolders!: ProjectGetters.SortedFolders
  @project.Getter getProjectsByFolderId!: ProjectGetters.GetProjectsByFolderId

  @set.State timeZone!: SetState.timeZone

  @Prop(String) search!: string

  created() {
    this.openSection('overview')
  }

  get folderOptions(): ListIcon[] {
    return [
      {
        name: 'Delete folder',
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.pushCenteredCard({
            type: 'Component',
            flexBasis: '475px',
            payload: 'The folder and all of the projects in it will be <strong>Deleted</strong>.',
            listIcons: [],
            listIconHandler: (confirm: boolean) => {
              console.log(confirm)
            },
            compName: 'Confirm',
          })
        },
      }
    ]
  }
  get getFoldersList(): AppnavDivisionEl[] {
    const fs = this.sortedFolders
    const arr: AppnavDivisionEl[] = []
    for (const f of fs) {
      const pros = this.getProjectsByFolderId(f.id)
      const list = []
      for (const p of pros)
        list.push({
          ...p,
          number: 0,
          show: true,
        })
      arr.push({
        name: f.name,
        id: f.id,
        list,
      })
    }
    return arr
  }
  get activePers(): string {
    if (this.viewType === 'project')
      return this.viewName
    return ''
  }
}

</script>
