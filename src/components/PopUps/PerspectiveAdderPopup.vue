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
        v-model='description'
        style='height: 100px;'
        :class='theme'
      ></textarea>
      <div class='flex margin'>
        <div class='flex-el'>
          <form-input
            type='text'
            placeholder='Font awesome icon class...'
            v-model='icon'
            :max='30'
          />
        </div>
        <div style='flex-basis: 10px'></div>
        <div class='flex-el'>
          <form-input
            type='text'
            placeholder='Font awesome icon color...'
            v-model='color'
            :max='30'
          />
        </div>
      </div>
      <button
        tabindex='2'
        class='button round-border margin'
        @click='add'
      >{{ buttonPlaceholder }}</button>
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
import FormOptions from '@/components/PopUps/FormComponents/FormOptions.vue'
import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

const labelStore = namespace('label')

import { Alert, Perspective } from '../../interfaces/app'

const perspectiveModule = namespace('perspective')

@Component({
  components: {
    'dropdown-input': DropdownInput,
    'form-checkbox': FormCheck,
    'form-options': FormOptions,
    'form-input': FormInput,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @State uid!: string
  @State('popUpPayload') pers!: Perspective
  @Getter isDesktop!: boolean
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUp!: (compName: string) => void

  @perspectiveModule.State perspectives!: Perspective[]
  // tslint:disable-next-line:max-line-length
  @perspectiveModule.Action addPerspective!: (obj: {name: string, description: string, iconColor: string, icon: string}) => void
  // tslint:disable-next-line:max-line-length
  @perspectiveModule.Action editPerspective!: (obj: {name: string, description: string, iconColor: string, icon: string, id: string}) => void

  input: string | null = null
  icon: string = 'layer-group'
  color: string = '#8C8C8C'
  description: string = ''
  value: string = ''
  options: string[] = []

  created() {
    if (this.pers) {
      this.input = this.pers.name
      this.icon = this.pers.icon
      this.color = this.pers.iconColor
      this.description = this.pers.description
    }
  }

  add() {
    if (this.value !== '') {
      const pers = this.perspectives.find(el => el.name === this.value)
      if (pers)
        this.pushAlert({
          name: `<strong>${this.value}</strong> already exists.`,
          duration: 3,
          type: 'error',
        })
      else if (!this.pers) {
        this.addPerspective({
          name: this.value,
          description: this.description,
          icon: this.icon,
          iconColor: this.color,
        })
        this.pushAlert({
          name: `<strong>${this.value}</strong> perspective was successfully added.`,
          duration: 2.5,
          type: 'success',
        })
      }
      else {
        this.editPerspective({
          id: this.pers.id,
          name: this.value,
          description: this.description,
          icon: this.icon,
          iconColor: this.color,
        })
        this.pushAlert({
          name: `<strong>${this.value}</strong> perspective was successfully edited.`,
          duration: 2.5,
          type: 'success',
        })
        this.pushPopUp('')
      }
    }
  }
  getOptions(): string[] {
    return this.perspectives.filter(el => el.name.includes(this.value)).map(el => el.name)
  }
  select(value: string) {
    this.input = value
  }

  get buttonPlaceholder(): string {
    if (!this.pers)
      return 'Add perspective'
    return 'Save perspective'
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped>

.flex {
  display: flex;
}

.flex-el {
  flex-basis: 50%;
}

</style>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
