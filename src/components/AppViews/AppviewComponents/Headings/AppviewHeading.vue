<template>
  <div class='heading-wrapper'>
    <div v-if="!editing" class='header' :class='theme' @click='showing = !showing' @dblclick="edit">
      <span class='txt' :class='theme'>{{ obj.name }}</span>
      <span v-if='obj.faded' class='txt faded' :class='theme'>{{ obj.faded }}</span>
    </div>
    <template v-else>
      <div>
        <drop-input
          tabindex='1'
          focus-class='headingedit'
          placeholder='Heading name...'
          :input-theme='theme'
          :disabled='true'
          :values='[]'
          :input='value'
          @enter='enter'
        />
      </div>
      <view-btn
        class='tiny'
        :waiting-response='false'
        @click="enter"
      >
        Save heading
      </view-btn>
      <span class="cancel pointer" @click="$emit('cancel')">Cancel</span>
    </template>
    <transition name='fade'>
      <div v-if='showing' class='content'>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { IndexState } from '../../../../interfaces/store/index'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import DropdownInput from '@/components/DropdownInput.vue'

@Component({
  components: {
    'view-btn': FormButton,
    'drop-input': DropdownInput,
  },
})
export default class AppviewHeading extends Vue {
  @State theme!: IndexState.theme

  @Prop(Object) obj!: {name: string, faded?: string}
  @Prop(Boolean) editing!: boolean
  @Prop(Boolean) allowEdit!: boolean

  showing: boolean = true
  value: string = ''

  enter() {
    if (this.value !== '')
      this.$emit('enter', this.value)
  }
  edit() {
    if (this.allowEdit) this.editing = !this.editing
  }
}

</script>

<style scoped>

.cancel {
  margin-left: 6px;
  color: #FF6B66;
}

.cancel:hover {
  text-decoration: underline;
}

.header {
  font-size: 1.5em;
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
}

.header.dark {
  border-bottom: 1px solid #292929;
}

.header.light {
  border-bottom: 1px solid #dbdbdb;
}

.heading-wrapper + .heading-wrapper {
  margin-top: 45px;
}

.faded {
  margin-left: 10px;
  font-size: .8em;
  opacity: .6;
}

</style>
