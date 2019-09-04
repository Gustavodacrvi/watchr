<template>
  <div class='component' v-if='prj'>
    <div :class="{pointer: !isDesktop}" @dblclick="toggleHide" class="header">
      <header-title
        :value='prj.name'
        icon=''
        icon-color=''
      />
      <div class="right">
        <view-header-icons
          v-model="search"
          :pers-name='prj.name'
          :allow-search='true'
          :allow-settings='false'
          :allow-labels='true'
          :allow-dates='true'
          :allow-smart-perspectives='true'
          :allow-priority='true'

          @priority='v => priority = v'
          @label='addLabelNonSave'
          @date='addDateNonSave'
          @smartpers='addSmartPersNonSave'
        />
      </div>
      <div class='margin'></div>
      <div v-if="!hided">
        <div>
          <div class='margin'></div>
          <view-tags
            :search='search'
            :labels='labels'
            :priority='priority'
            :dates='dates'
            :smart-pers='smartPers'
            @clearsearch='v => search = ""'
            @clearpriority='v => priority = ""'
            @removelabel='removeLabelNonSave'
            @removedate='removeDateNonSave'
            @removesmartpers='removeSmartPersNonSave'
          />
        </div>
        <task-renderer v-if='getLabel'
          id='appnavproject'
          :tasks='getTasks'
          :default-priority='priority'
          :default-labels='getLabels'
          :allow-priority='true'
          :fix-adder-position='true'
          :insert-before='true'
          :always-show-last-edit-date='false'
          :always-show-creation-date='false'
          :always-show-task-labels='false'
          :allow-labels='true'
          :allow-date='true'
          @update='onUpdate'
          @selected='onSelect'
          @add='addProjectTask'
        />
      </div>
      <div class='margin-task' :class='platform'></div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import PersMixin from '@/mixins/perspective'

const task = namespace('task')
const prjVuex = namespace('project')

import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'

import { Project, Label, Task } from '@/interfaces/app'
import { ProjectActions, ProjectGetters } from '../../../interfaces/store/project'

@Component({
  components: {
    'header-title': HeaderTitle,
    'view-header-icons': AppviewHeaderIcons,
    'view-tags': AppviewTags,
  },
})
export default class ProjectAppview extends Mixins(PersMixin) {
  @prjVuex.Getter getProjectByName!: ProjectGetters.GetProjectByName

  @Prop(String) project!: string

  addProjectTask(obj: any) {
    console.log('addProjectTask', obj)
  }
  onUpdate(obj: any) {
    console.log('onUpdateProjectTask', obj)
  }

  get getTasks(): Task[] {
    
    
    return []
  }
  get prj(): Project | undefined {
    console.log(this.project)
    return this.getProjectByName(this.project)
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
