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
          @label='addLabel'
          @date='addDate'
          @smartpers='addSmartPers'
        />
      </div>
    </div>
  </div>
  <div v-else>asdfj açsdsfk asçdlfkj asçdlfjk asçdfj çasldkfjç </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Mixins } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import PersMixin from '@/mixins/perspective'

const task = namespace('task')
const prjVuex = namespace('project')

import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'
import AppviewHeaderIcons from '@/components/AppViews/AppviewComponents/AppviewHeadericons.vue'

import { Project, Label } from '@/interfaces/app'
import { ProjectActions, ProjectGetters } from '../../../interfaces/store/project'

@Component({
  components: {
    'header-title': HeaderTitle,
    'view-header-icons': AppviewHeaderIcons,
  },
})
export default class ProjectAppview extends Mixins(PersMixin) {
  @prjVuex.Getter getProjectByName!: ProjectGetters.GetProjectByName

  @Prop(String) project!: string

  addLabel(label: Label) {
    if (!this.labels.find(el => el === label.id))
      this.labels.push(label.id)
  }
  addDate(date: string) {
    if (!this.dates.find(el => el === date))
      this.dates.push(date)
  }
  addSmartPers(name: string) {
    if (!this.smartPers.find(el => el === name))
      this.smartPers.push(name)
  }

  get prj(): Project | undefined {
    console.log(this.project)
    return this.getProjectByName(this.project)
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
