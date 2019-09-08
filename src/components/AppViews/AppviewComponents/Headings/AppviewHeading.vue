<template>
  <div class='heading-wrapper heading-adder'>
    <div v-if="!editingHeading" class='header heading-handle'
      :class='theme'
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
      @click='showing = !showing'
      @dblclick="edit"
    >
      <span class='txt big' :class='theme'>{{ obj.name }}</span>
      <span v-if='obj.faded' class='txt faded' :class='theme'>{{ obj.faded }}</span>
      <transition name="fade">
        <div class="right" v-if="onHover">
          <icon-options v-if="options && options.length > 0"
            handle='ellipsis-h'
            size='lg'
            min-width='275px'
            :options='options'
            :payload='payload'
          />
        </div>
      </transition>
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
          @value='v => value = v'
        />
      </div>
      <view-btn
        class='tiny'
        :waiting-response='false'
        @click="enter"
      >
        Save heading
      </view-btn>
      <span class="cancel pointer" @click="cancel">Cancel</span>
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
import { ListIcon } from '@/interfaces/app'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'
import DropdownInput from '@/components/DropdownInput.vue'
import AppviewIconoptions from '@/components/AppViews/AppviewComponents/AppviewIconoptions.vue'

@Component({
  components: {
    'view-btn': FormButton,
    'drop-input': DropdownInput,
    'icon-options': AppviewIconoptions,
  },
})
export default class AppviewHeading extends Vue {
  @State theme!: IndexState.theme

  @Prop(Object) obj!: {name: string, faded?: string}
  @Prop(Array) options!: ListIcon[]
  @Prop(Boolean) editing!: boolean
  @Prop(Boolean) allowEdit!: boolean
  @Prop() payload!: any

  showing: boolean = true
  onHover: boolean = false
  editingHeading: boolean = false
  value: string = ''

  created() {
    if (this.obj && this.obj.name)
      this.value = this.obj.name
    this.editingHeading = this.editing
  }

  mounted() {
    if (this.editingHeading)
      this.focus()
  }

  enter() {
    if (this.value !== '') {
      if (!this.payload)
        this.$emit('enter', this.value)
      else this.$emit('enter', {name: this.value, payload: this.payload})
      this.cancel()
    }
  }
  cancel() {
    this.$emit('cancel')
    this.editingHeading = false
  }
  focus() {
    setTimeout(() => {
      const el = this.$el.getElementsByClassName('headingedit')[0] as any
      if (el)
        el.focus()
    }, 100)
  }
  edit() {
    if (this.allowEdit) {
      this.editingHeading = true
      this.focus()
    }
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
  height: 40px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
}

.big {
  font-size: 1.4em;
}

.header.dark {
  border-bottom: 1px solid #292929;
}

.right {
  position: absolute;
  right: 5px; 
}

.header.light {
  border-bottom: 1px solid #dbdbdb;
}

.heading-wrapper + .heading-wrapper {
  margin-top: 45px;
}

.faded {
  margin-left: 10px;
  opacity: .6;
}

</style>
