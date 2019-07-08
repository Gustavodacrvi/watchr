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
          <view-tag v-if='fixedTag'
            :name='fixedTag'
            :fixed='true'
            icon='tag'
            back-color='#83B7E2'
          />
        </div>
        <div class='margin'>
          <form-input
            placeholder='Do something #label'
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
            <dynamic-ft-icon
              class='icon pointer txt'
              icon='exclamation'
              size='lg'
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import Tag from '@/components/AppViews/AppviewComponents/AppviewIcon.vue'
import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'view-tag': Tag,
    'form-input': FormInput,
    'view-btn': FormButton,
  },
})
export default class TaskAdder extends Vue {
  @Prop() fixedTag!: string

  value: string = ''
  showing: boolean = false

  add() {
    if (this.value)
      this.$emit('add', {
        value: this.value,
        fixedTag: this.fixedTag,
      })
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
