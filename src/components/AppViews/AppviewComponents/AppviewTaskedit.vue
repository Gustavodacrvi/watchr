<template>
  <div class='task-adder'>
    <div>
      <transition name='fade'>
        <view-tags v-if='priority || fixedPers || getLabels.length > 0'
          :fixed-pers='fixedPers'
          :priority='priority'
          :labels='getLabels'
          @clearpriority="v => priority = ''"
          @removelabel='removeLabel'
        />
      </transition>
    </div>
    <div class='margin input-div'>
      <drop-input
        tabindex='1'
        :placeholder='inputPlaceholder'
        :disabled='true'
        :values='options'
        :input='value'
        @value="v => value = v"
        @enter='enter'
        @select='selectDropValue'
      />
    </div>
    <div class='margin options'>
      <view-btn
        class='tiny'
        :waiting-response='false'
        @click="enter"
      >
        {{ btn }}
      </view-btn>
      <span class='cancel pointer' @click="$emit('cancel')">Cancel</span>
      <div class='right'>
        <div v-if='allowLabels' class='header-option'>
          <drop-finder
            handle='tags'
            size='lg'
            min-width='300px'
            :list='savedLabels'
            @select='selectLabel'
          />
        </div>
        <div v-if='allowPriority' class='header-option'>
          <view-options
            handle='exclamation'
            size='lg'
            min-width='200px'
            :options='priorityIcons'
            @click="chosePriority"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const labelsVuex = namespace('label')

import { ListIcon, Task, Label } from '../../../interfaces/app'

import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTaskedit.vue'
import DropdownInput from '@/components/DropdownInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'

@Component({
  components: {
    'view-btn': FormButton,
    'drop-input': DropdownInput,
    'task-edit': TaskEditTemplate,
    'view-options': AppviewIconoptions,
    'view-tag': Tag,
    'drop-finder': DropdownFinder,
    'view-tags': AppviewTags,
  },
})
export default class AppviewTaskedit extends Vue {
  @Prop({default: 'Add task', type: String}) btn!: string
  @Prop({default: false, type: Boolean}) closeOnSave!: boolean
  @Prop(String) fixedPers!: string
  @Prop(String) defaultPriority!: string
  @Prop(Array) defaultLabels!: string[]
  @Prop({default: false, type: Boolean}) allowPriority!: boolean
  @Prop({default: false, type: Boolean}) allowLabels!: boolean

  @labelsVuex.State('labels') savedLabels!: Label[]
  @labelsVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  value: string = ''
  optionsType: string = ''
  priority: '' | 'Low priority' | 'High priority' | 'Medium priority' = ''
  options: string[] = []
  labels: string[] = []
  priorityIcons: ListIcon[] = [
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
  ]

  created() {
    if (this.defaultLabels)
      this.labels = this.defaultLabels
    if (this.defaultPriority)
      this.priority = this.defaultPriority as any
  }

  selectDropValue(value: string) {
    const arr = this.value.split(' ')
    arr[arr.length - 1] = this.optionsType + value
    let str = ''
    for (const s of arr)
      str += s + ' '
    str = str.slice(0, -1)
    this.value = str
  }
  enter() {
    if (this.value)
      this.$emit('enter', {name: this.value, priority: this.priority, labels: this.labels})
    this.value = ''
  }
  removeLabel(id: string) {
    const index = this.labels.findIndex(el => el === id)
    this.labels.splice(index, 1)
  }
  selectLabel(label: Label) {
    this.labels.push(label.id)
  }
  chosePriority(priority: 'Low priority' | 'High priority' | 'Medium priority') {
    this.priority = priority
  }

  get getLabels(): Label[] {
    return this.getLabelsByIds(this.labels)
  }
  get inputPlaceholder(): string {
    let str = 'Do something'
    if (this.allowPriority)
      str += ' !high !medium !low'
    if (this.allowLabels)
      str += ' #label'
    return str
  }

  @Watch('value')
  onValue() {
    let changedOptions: boolean = false
    if (this.allowPriority) {
      if (this.value.includes(' !high')) {
        this.priority = 'High priority'
        this.value = this.value.replace(' !high', '')
      } else if (this.value.includes(' !medium')) {
        this.priority = 'Medium priority'
        this.value = this.value.replace(' !medium', '')
      } else if (this.value.includes(' !low')) {
        this.priority = 'Low priority'
        this.value = this.value.replace(' !low', '')
      }
      const arr = this.value.split(' ')
      const lastWord = arr[arr.length - 1]
      if (lastWord[0] === '!') {
        this.optionsType = '!'
        const word = lastWord.substr(1)

        const options = []
        for (const i of this.priorityIcons)
          if (i.name && i.name === 'Low priority')
            options.push('low')
          else if (i.name && i.name === 'High priority')
            options.push('high')
          else options.push('medium')

        this.options = options.filter(el => el.includes(word))
        changedOptions = true
      }
    }
    if (this.allowLabels) {
      const labels = this.savedLabels
      for (const lab of labels) {
        if (this.value.includes(` #${lab.name}`)) {
          this.value = this.value.replace(` #${lab.name}`, '')
          this.labels.push(lab.id)
          break
        }
      }
      const arr = this.value.split(' ')
      const lastWord = arr[arr.length - 1]
      if (lastWord[0] === '#') {
        this.optionsType = '#'
        const word = lastWord.substr(1)
        
        this.options = labels.map(el => el.name).filter(el => el.includes(word))
        changedOptions = true
      }
    }
    if (!changedOptions)
      this.options = []
  }
}

</script>

<style scoped>

.right {
  position: absolute;
  right: 0;
  display: inline-block;
}

.header-option {
  display: inline-block;
  margin-right: 10px;
}

.cancel {
  margin-left: 6px;
  color: #FF6B66;
}

.options {
  position: relative;
  display: flex;
  align-items: center;
}

.margin {
  margin-top: 4px;
}

.input-div {
  position: relative;
  z-index: 5;
}

</style>
