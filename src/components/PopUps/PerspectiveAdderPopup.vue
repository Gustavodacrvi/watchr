<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add perspective</h3>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        placeholder='Perspective title...'
        :input='input'
        :values='options'
        @enter='add'
        @value='v => value = v'
        @select='select'
        @focus='options = getOptions()'
      />
      <textarea
        tabindex='2'
        class='margin gray round-border input textarea txt scroll'
        placeholder='Perspective description...'
        :class='theme'
      ></textarea>
      <div class='margin'>
        <form-checkbox v-model='pinOnOverview' name='Pin on overview'/>
        <form-checkbox v-model='showNumberOfTasks' name='Show number of tasks'/>
      </div>
      <div v-if='pinOnOverview' class='margin'>
        <form-checkbox v-model='showWhenNotEmpty' name='Show only when not empty'/>
      </div>
      <button
        tabindex='2'
        class='button round-border margin'
        @click='add'
      >Add perspective</button>
      <span v-show='isDesktop'
        class='margin txt'
      >You can open this pop up at any time by clicking the 'P' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
      >You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

import DropdownInput from '@/components/DropdownInput.vue'
import FormCheck from '@/components/PopUps/FormComponents/FormCheckbox.vue'

const labelStore = namespace('label')

import { Alert, Perspective } from '../../interfaces/app'

const perspectiveModule = namespace('perspective')

@Component({
  components: {
    'dropdown-input': DropdownInput,
    'form-checkbox': FormCheck,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @State uid!: string
  @State popUpPayload!: any
  @Getter isDesktop!: boolean
  @Mutation pushAlert!: (alert: Alert) => void

  @perspectiveModule.State smartPerspectives!: Perspective[]
  @perspectiveModule.State customPerspectives!: Perspective[]

  input: string | null = null
  showNumberOfTasks: boolean = false
  showWhenNotEmpty: boolean = false
  pinOnOverview: boolean = false
  value: string = ''
  options: string[] = []

  created() {
    this.input = this.popUpPayload
  }

  add() {
    if (this.value !== '') {
      
    }
  }

  getOptions(): string[] {
    const merge = this.customPerspectives.concat(this.smartPerspectives)
    return merge.filter(el => el.name.includes(this.value)).map(el => el.name)
  }

  select(value: string) {
    this.input = this.value
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
