<template>
  <div>
    <transition name='fade' mode='out-in'>
      <div v-if='!showing' @click='showing = true' key='notshowing' class='msg'>
        <dynamic-ft-icon
          class='icon pointer txt'
          icon='plus'
          size='lg'
        />
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
        <div class='margin'>
          <form-input
            placeholder='Do something #label !high !medium !low'
            v-model='value'
            :max='200'
            :disabled='true'
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

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'
import Tag from '@/components/AppViews/AppviewComponents/AppviewIcon.vue'
import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

import { ListIcon } from '../../../interfaces/app'

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'view-tag': Tag,
    'form-input': FormInput,
    'view-btn': FormButton,
    'view-options': AppviewIconoptions,
  },
})
export default class TaskAdder extends Vue {
  @Prop() fixedTag!: string
  @Prop({default: false}) allowPriority!: boolean

  value: string = ''
  showing: boolean = false
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
      this.$emit('add', {
        value: this.value,
        fixedTag: this.fixedTag,
      })
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

</style>
