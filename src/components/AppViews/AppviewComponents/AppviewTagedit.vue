<template>
  <div class='task-adder'>
    <div>
      <div v-if='fixedTag'>
        <view-tag
          :name='fixedTag'
          :fixed='true'
          icon='tag'
          back-color='#83B7E2'
        />
      </div>
      <transition name='fade'>
        <div v-if='allowPriority && priority'>
          <view-tag v-if='fixedTag'
            :name='priority'
            :fixed='false'
            icon='exclamation'
            back-color='#70ff66'
            @click="v => priority = ''"
          />
        </div>
      </transition>
    </div>
    <div class='margin input-div'>
      <drop-input
        tabindex='1'
        placeholder='Do something #label !high !medium !low'
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
        <view-options v-if='allowPriority'
          handle='exclamation'
          size='lg'
          min-width='200px'
          :options='icons'
          @click="chosePriority"
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { ListIcon, Task } from '../../../interfaces/app'

import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import TaskEditTemplate from '@/components/AppViews/AppviewComponents/AppviewTagedit.vue'
import DropdownInput from '@/components/DropdownInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'view-btn': FormButton,
    'drop-input': DropdownInput,
    'task-edit': TaskEditTemplate,
    'view-options': AppviewIconoptions,
    'view-tag': Tag,
  },
})
export default class AppviewTagedit extends Vue {
  @Prop({default: 'Add task', type: String}) btn!: string
  @Prop({default: false, type: Boolean}) closeOnSave!: boolean
  @Prop(Object) task!: Task
  @Prop(String) fixedTag!: string
  @Prop(Boolean) allowPriority!: boolean

  value: string = ''
  optionsType: string = ''
  priority: '' | 'Low priority' | 'High priority' | 'Medium priority' = ''
  options: string[] = []
  icons: ListIcon[] = [
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
    if (this.task)
      this.getDataFromTask()
  }

  getDataFromTask() {
    this.value = this.task.name
    this.priority = this.task.priority
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
      this.$emit('enter', {name: this.value, priority: this.priority})
    this.value = ''
  }
  chosePriority(priority: 'Low priority' | 'High priority' | 'Medium priority') {
    this.priority = priority
  }
  
  @Watch('value')
  onValue() {
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
        for (const i of this.icons)
          if (i.name && i.name === 'Low priority')
            options.push('low')
          else if (i.name && i.name === 'High priority')
            options.push('high')
          else options.push('medium')

        this.options = options
      } else this.options = []
    }
  }
  @Watch('task')
  onChange() {
    if (this.task)
      this.getDataFromTask()
  }
}

</script>

<style scoped>

.right {
  position: absolute;
  right: 0;
  display: inline-block;
}

.right .icon {
  margin-left: 6px;
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
  margin-top: 2px;
}

.input-div {
  position: relative;
  z-index: 5;
}

</style>
