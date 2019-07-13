<template>
  <div class='wrapper'>
    <transition name='fade' mode='out-in'>
      <div v-if='!showing' @click='showing = true' key='notshowing' class='msg'>
        <i class='icon pointer txt fas fa-plus fa-lg'></i>
        <span class='txt name'>Add task</span>
      </div>
      <div v-else key='showing' class='task-adder'>
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
            @enter='add'
            @select='selectDropValue'
          />
        </div>
        <div class='margin options'>
          <view-btn
            class='tiny'
            :waiting-response='false'
            @click='add'
          >
            Add task
          </view-btn>
          <span class='cancel pointer' @click='showing = false'>Cancel</span>
          <div class='right'>
            <view-options v-if='allowPriority'
              handle='exclamation'
              size='lg'
              min-width='200px'
              :options='icons'
              @click='chosePriority'
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import Tag from '@/components/AppViews/AppviewComponents/AppviewTag.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import DropdownInput from '@/components/DropdownInput.vue'

import { ListIcon, Task } from '../../../interfaces/app'

const taskVuex = namespace('task')

@Component({
  components: {
    'view-tag': Tag,
    'view-btn': FormButton,
    'view-options': AppviewIconoptions,
    'drop-input': DropdownInput,
  },
})
export default class TaskAdder extends Vue {
  @Prop() fixedTag!: string
  @Prop({default: false}) allowPriority!: boolean

  value: string = ''
  showing: boolean = false
  options: string[] = []
  optionsType: string = ''
  priority: '' | 'Low priority' | 'High priority' | 'Medium priority' = ''
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

  add() {
    if (this.value)
      this.$emit('add', {name: this.value, priority: this.priority})
    this.value = ''
  }
  chosePriority(priority: 'Low priority' | 'High priority' | 'Medium priority') {
    this.priority = priority
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

        this.options = arr
      } else this.options = []
    }
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

.msg {
  height: 25px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.msg:hover .name, .msg:hover .icon, .cancel {
  color: #FF6B66;
}

.cancel {
  margin-left: 6px;
}

.options {
  position: relative;
  display: flex;
  align-items: center;
}

.name {
  margin-left: 12px;
}

.margin {
  margin-top: 2px;
}

.input-div {
  position: relative;
  z-index: 5;
}

</style>
