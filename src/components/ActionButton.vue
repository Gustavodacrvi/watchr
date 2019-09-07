<template>
  <div class='wrapper actions-button-wrapper'>
    <div class='relative-wrapper action-comp'>
      <transition name='fade'>
        <div v-if='showing'
          class='margin'
          @click='showing = false'></div>
      </transition>
      <span id='floating-btn'
        @click='showing = !showing'
        data-sortfrom='actionbutton'
      >
        <span class='right main-button'>
          <i class='icon txt pointer fas fa-plus' style="color: white"></i>
          <span class='txt msg' :class='theme'>Add task</span>
        </span>
      </span>
      <span id="left-floating-btn" :class='{"hide-left-main-btn": !showLeftButton}' data-sortfrom='actionbuttonleft'>
        <transition name="fade">
          <span class="left main-button" :class="platform">
            <i class="icon txt pointer fas fa-heading" style='color: white;'></i>
            <span class="txt msg" :class="theme">Add heading</span>
          </span>
        </transition>
      </span>
      <transition name='below-trans'>
        <div v-show='selectedTasks.length > 0'
          class='left-wrapper'
        >
          <span v-for='b of leftButtons'
            :key='b.icon'
            class='btn left floating-btn'
            :style='{backgroundColor: b.backColor}'
            @click='b.click'
          >
            <i :class='`icon txt pointer fas fa-${b.icon}`' style='color: white'></i>
          </span>
        </div>
      </transition>
      <transition name='top-trans'>
        <div v-if='showing'
          class='top-wrapper'>
          <span v-for='btn in topButtons'
            class='btn top floating-btn'
            :key='btn.icon'
            :style='`background-color: ${btn.backColor}`'
            @click='btn.click'
          >
            <i :class='`icon txt pointer fas fa-${btn.icon}`' :style='{color: btn.iconColor}'></i>
          </span>
        </div>
      </transition>
      <transition name='below-trans'>
        <div v-if='isDesktop && selectedTasks.length > 0'
          class='options-wrapper'>
          <span v-for='btn in optionsButtons'
            class='btn option floating-btn'
            :key='btn.icon'
            :style='`background-color: ${btn.backColor}`'
            @click.prevent='btn.click'
          >
            <i :class='`icon txt pointer fas fa-${btn.icon}`' :style='{color: btn.iconColor}'></i>
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State, Getter, namespace } from 'vuex-class'

const task = namespace('task')
const set = namespace('settings')
const project = namespace('project')

import Sortable from 'sortablejs'
import { IndexState, IndexMutations } from '../interfaces/store/index'

import moment from 'moment-timezone'

import appUtils from '@/utils/app'

import { FloatingButton } from '@/interfaces/app'
import { TaskActions } from '../interfaces/store/task'
import { SetState } from '../interfaces/store/settings'
import { IndexGetters } from '../interfaces/store/'
import { ProjectActions } from '../interfaces/store/project'

@Component
export default class ActionButtonComp extends Vue {
  @State theme!: IndexState.theme
  @State selectedTasks!: IndexState.selectedTasks
  @State viewType!: IndexState.viewType
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
  @Mutation pushPopUp!: IndexMutations.PushPopUp
  @Mutation pushPopUpPayload!: IndexMutations.PushPopUpPayload

  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  @task.Action saveNewDateOfTasks!: TaskActions.SaveNewDateOfTasks
  @task.Action changePrioritysByIds!: TaskActions.ChangePrioritysByIds
  @task.Action deleteTasksById!: TaskActions.DeleteTasksById

  @set.State startOfTheWeek!: SetState.startOfTheWeek

  topButtons: FloatingButton[] = [
    {icon: 'bolt', iconColor: 'white', backColor: '#FFE366', click: this.popUp('TaskadderPopup')},
    {icon: 'project-diagram', iconColor: 'white', backColor: '#CD66FF', click: this.popUp('AddProjectPopup')},
    {icon: 'tags', iconColor: 'white', backColor: '#FF6B66', click: this.popUp('LabeladderPopup')},
    {icon: 'layer-group', iconColor: 'white', backColor: '#6b66ff', click: this.popUp('PerspectiveAdderPopup')},
  ]
  leftButtons: FloatingButton[] = [
    {icon: 'star', iconColor: 'white', backColor: '#FFE366', click: this.postPoneToday},
    {icon: 'sun', iconColor: 'white', backColor: '#ffa166', click: this.postPoneTomorrow},
    {icon: 'calendar', iconColor: 'white', backColor: '#9ce283', click: this.postPoneNextWeek},
  ]
  optionsButtons: FloatingButton[] = [
    {icon: 'tags', iconColor: 'white', backColor: '#FF6B66', click: this.popUp('AddLabelsToTasksPopup', true)},
    {icon: 'calendar-day', iconColor: 'white', backColor: '#9ce283', click: this.centeredCard({
      type: 'Component',
      flexBasis: '275px',
      listIcons: [],
      listIconHandler: (el: any) => this.changeDate(el),
      compName: 'CalendarInput',
    })},
    {icon: 'exclamation', iconColor: 'white', backColor: '#ffa166', click: this.centeredCard({
      type: 'ListIcons',
      flexBasis: '275px',
      listIcons: [
        {
          name: 'High priority',
          icon: 'exclamation',
          iconColor: '#FF6B66',
          size: 'lg',
        },
        {
          name: 'Medium priority',
          icon: 'exclamation',
          iconColor: '#fff566',
          size: 'lg',
        },
        {
          name: 'Low priority',
          icon: 'exclamation',
          iconColor: '#70ff66',
          size: 'lg',
        },
      ],
      listIconHandler: (el: any) => this.changePriority(el),
      compName: '',
    })},
    {icon: 'trash', iconColor: 'white', backColor: '#FF6B66', click: this.delete},
  ]
  showing: boolean = false
  tasks: string[] = []

  mounted() {
    this.mount()
  }

  mount() {
    const el = document.getElementById('floating-btn')
    const sort = new Sortable(el, {
      disabled: false,
      group: {name: 'floatbutton', pull: 'clone', put: false},
      animation: 150,
    })
    const elLeft = document.getElementById('left-floating-btn')
    const sortLeft = new Sortable(elLeft, {
      disabled: false,
      group: {name: 'floatbutton', pull: 'clone', put: false},
      animation: 150,
    })
  }

  delete() {
    this.deleteTasksById(this.selectedTasks)
  }
  postPone(mom: any) {
    const arr = []
    for (const id of this.selectedTasks)
      arr.push({
        id, date: mom.format('Y-M-D'),
      })
    this.saveNewDateOfTasks(arr)
  }
  postPoneToday() {
    this.postPone(moment())
  }
  postPoneTomorrow() {
    this.postPone(moment().add(1, 'd'))
  }
  postPoneNextWeek() {
    this.postPone(appUtils.getNextWeek(moment(), this.startOfTheWeek))
  }
  popUp(compName: string, sendIds?: boolean): () => void {
    return () => {
      this.pushPopUp(compName)
      if (sendIds) this.pushPopUpPayload(this.selectedTasks)
    }
  }
  changePriority(value: string) {
    this.changePrioritysByIds({
      ids: this.selectedTasks,
      priority: value,
    })
  }
  changeDate(value: any) {
    const arr: Array<{id: string, date: string}> = []
    for (const id of this.selectedTasks)
      arr.push({id, date: value.utc.date})
    if (arr.length > 0)
      this.saveNewDateOfTasks(arr)
  }
  centeredCard(centeredCard: IndexState.centeredCard) {
    return () => {
      this.pushCenteredCard(centeredCard)
      this.tasks = this.selectedTasks
    }
  }

  get showLeftButton(): boolean {
    return this.selectedTasks.length === 0 && this.viewType === 'project'
  }
}

</script>

<style scoped>

.left-wrapper, .top-wrapper, .options-wrapper {
  display: flex;
  align-items: center;
}

.option {
  margin: 0 6px;
}

.wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
  z-index: 999;
}

.relative-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.margin {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: all;
  background-color: rgba(0, 0, 0, .4);
}

.left-wrapper {
  position: absolute;
  height: 45px;
  bottom: 16px;
  right: 70px;
  flex-direction: row-reverse;
}

.top-wrapper {
  position: absolute;
  width: 45px;
  bottom: 70px;
  right: 16px;
  flex-direction: column-reverse;
}

.options-wrapper {
  flex-direction: row-reverse;
  position: absolute;
  height: 45px;
  bottom: 16px;
  left: 296px;
}

.option {
  margin: 0 6px;
}

.btn {
  display: inline-block;
  border-radius: 100px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: all;
}

.floating-btn {
  position: relative;
  transition: filter .2s, transform .2s;
}

.main-button.left {
  transition: opacity .3s;
}

.hide-left-main-btn .main-button {
  opacity: 0;
}

.comp {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  transition-duration: .2s;
}

.floating-btn:hover {
  transform: scale(1.05, 1.05);
  filter: brightness(1.1);
}

.btn.left.hover {
  transform: scale(1.1,1.1);
  filter: brightness(1.1);
}

.btn.left {
  margin: 0 6px;
}

.btn.top {
  margin: 6px 0;
}

.below-trans-enter-active {
  transition: bottom .3s ease-in;
}

.below-trans-leave-active {
  transition: bottom .3s ease-out;
}

.below-trans-enter {
  bottom: -50px;
}

.below-trans-enter-to, .below-trans-leave {
  bottom: 16px;
}

.below-trans-leave-to {
  bottom: -50px;
}

.top-trans-enter-active, .top-trans-leave-active {
  transition: right .3s;
}

.top-trans-enter, .top-trans-leave-to {
  right: -50px;
}

.top-trans-enter-to, .top-trans-leavev {
  right: 16px;
}

</style>
