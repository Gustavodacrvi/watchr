<template>
  <div class='component' v-if='prj'>
    <div :class="{pointer: !isDesktop}" @dblclick="toggleHide" class="header">
      <header-title
        :value='prj.name'
        icon=''
        icon-color=''
      />
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const task = namespace('task')

import HeaderTitle from '@/components/AppViews/AppviewComponents/AppviewHeadertitle.vue'

import { Project } from '@/interfaces/app'
import { ProjectActions, ProjectGetters } from '../../../interfaces/store/project'

@Component({
  components: {
    'header-title': HeaderTitle,
  },
})
export default class ProjectAppview extends Vue {
  @task.Action getProjectByName!: ProjectGetters.GetProjectByName

  @Prop(String) project!: string

  get prj(): Project | undefined {
    return this.getProjectByName(this.project)
  }
}

</script>

<style scoped src='@/assets/css/appView.css'>
</style>
