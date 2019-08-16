<template>
  <div class='label-adder'>
    <div class='title'>
      <h3 v-if='!pers'>Add perspective</h3>
      <h3 v-else>Edit perspective</h3>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        placeholder='Perspective title...'
        focus-class='persadder'
        :input='input'
        :values='options'
        @enter='add'
        @value='v => value = v'
        @select='select'
        @focus='options = getOptions()'
        style='position: relative;z-index: 5;'
      />
      <textarea
        tabindex='2'
        class='margin gray round-border input textarea txt scroll gray dark'
        placeholder='Perspective description...'
        v-model='description'
        style='height: 100px;'
      ></textarea>
      <div class='flex margin' :class='platform'>
        <div class='flex-el font-awesome-classes scroll'>
          <form-input
            type='text'
            placeholder='Font awesome icon class...'
            v-model='icon'
            input-theme='dark'
            :max='30'
            @focus='showingIconsDropdown = true'
            @blur='showingIconsDropdown = false'
          />
          <i :class='`fas txt dark fa-${icon.replace(/\s/g, "-")} fa-lg active-icon`' :style='{color: color}'></i>
          <transition name='fade'>
            <div v-if='showingIconsDropdown' class='card dark round-border icons dark scroll'>
              <i v-for='i in icons'
                :key='i'
                :class='`fas txt dark ${i.replace(/\s/g, "-")} fa-sm`'
                @click='v => icon = i.replace("fa ", "")'
              ></i>
            </div>
          </transition>
        </div>
        <div style='flex-basis: 10px'></div>
        <div class='flex-el'>
          <form-input
            type='text'
            placeholder='Font awesome icon color...'
            v-model='color'
            input-theme='dark'
            :max='30'
          />
        </div>
      </div>
      <div class='flex margin' :class='platform'>
        <form-checkbox
          :class='platform'
          name='Always show labels'
          v-model='alwaysShowLabels'
          input-theme='dark'
        />
        <form-checkbox
          :class='platform'
          name='Always show edit dates'
          v-model='alwaysShowEditDate'
          input-theme='dark'
        />
        <form-checkbox
          :class='platform'
          name='Always show creation dates'
          v-model='alwaysShowCreationDate'
          input-theme='dark'
        />
      </div>
      <button
        tabindex='2'
        class='button round-border margin'
        @click='add'
      >{{ buttonPlaceholder }}</button>
      <span v-show='isDesktop'
        class='margin txt' :class='theme'
      >You can open this pop up at any time by clicking the 'P' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
        :class='theme'
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

import fontAwesomeClasses from '@/utils/fontAwesomeClasses'

const labelStore = namespace('label')
const perspectiveModule = namespace('perspective')

import { Alert, Perspective } from '../../interfaces/app'
import { IndexState, IndexGetters, IndexMutations } from '../../interfaces/store/index'

interface Pers {
  name: string
  description: string
  iconColor: string
  icon: string
  alwaysShowTaskLabels: boolean
  alwaysShowLastEditDate: boolean
  alwaysShowCreationDate: boolean
}

@Component({
  components: {
    'dropdown-input': DropdownInput,
    'form-checkbox': FormCheck,
    'form-options': FormOptions,
    'form-input': FormInput,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: IndexState.theme
  @State uid!: IndexState.uid
  @State('popUpPayload') pers!: IndexState.popUpPayload
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
  @Mutation pushAlert!: IndexMutations.PushAlert
  @Mutation pushPopUp!: IndexMutations.PushPopUp

  @perspectiveModule.State perspectives!: Perspective[]
  @perspectiveModule.Action addPerspective!: (obj: Pers) => void
  @perspectiveModule.Action editPerspective!: (obj: Pers & {id: string}) => void

  input: string | null = null
  icon: string = 'layer group'
  color: string = '#8C8C8C'
  description: string = ''
  value: string = ''
  options: string[] = []
  alwaysShowLabels: boolean = true
  alwaysShowEditDate: boolean = true
  alwaysShowCreationDate: boolean = true
  showingIconsDropdown: boolean = false

  created() {
    if (this.pers) {
      this.input = this.pers.name
      if (this.input)
        this.value = this.input
      this.icon = this.pers.icon
      this.color = this.pers.iconColor
      this.description = this.pers.description
      this.alwaysShowCreationDate = this.pers.alwaysShowCreationDate
      this.alwaysShowLabels = this.pers.alwaysShowTaskLabels
      this.alwaysShowEditDate = this.pers.alwaysShowLastEditDate
    }
  }
  mounted() {
    const el = document.querySelectorAll('.persadder')[0] as any
    el.focus()
    if (!this.pers)
      setTimeout(() => {
        this.input = ''
      }, 100)
  }

  add() {
    if (this.value !== '') {
      const pers = this.perspectives.find(el => el.name === this.value)
      if (pers && !this.pers)
        this.pushAlert({
          name: `<strong>${this.value}</strong> already exists.`,
          duration: 3,
          type: 'error',
        })
      else if (!this.pers) {
        this.addPerspective({
          name: this.value,
          description: this.description,
          icon: this.icon.replace(/\s/g, '-'),
          iconColor: this.color,
          alwaysShowTaskLabels: this.alwaysShowLabels,
          alwaysShowLastEditDate: this.alwaysShowEditDate,
          alwaysShowCreationDate: this.alwaysShowCreationDate,
        })
        this.pushAlert({
          name: `<strong>${this.value}</strong> perspective was successfully added.`,
          duration: 2.5,
          type: 'success',
        })
      } else {
        this.editPerspective({
          id: this.pers.id,
          name: this.value,
          description: this.description,
          icon: this.icon.replace(/\s/g, '-'),
          iconColor: this.color,
          alwaysShowTaskLabels: this.alwaysShowLabels,
          alwaysShowLastEditDate: this.alwaysShowEditDate,
          alwaysShowCreationDate: this.alwaysShowCreationDate,
        })
        this.$router.push('user?pers=' + this.value)
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

  get spacedIcons(): string[] {
    return fontAwesomeClasses.map(el => el.replace(/-/g, ' '))
  }
  get icons(): string[] {
    return this.spacedIcons.filter(el => el.includes(this.icon))
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

.font-awesome-classes {
  position: relative;
}

.active-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 12px;
}

.icons {
  position: absolute;
  width: 100%;
  overflow: auto;
  max-height: 250px;
  display: flex;
  flex-wrap: wrap;
  font-size: 1.4em;
}

.icons .fas {
  cursor: pointer;
  flex-basis: 40px;
  line-height: 40px;
  text-align: center;
  transition: transform .3s;
}

.icons .fas:hover {
  transform: scale(1.2);
}

.flex {
  display: flex;
}

.flex.mobile {
  flex-direction: column;
}

.checkbox.mobile + .checkbox.mobile {
  margin-left: 0 !important;
  margin-top: 8px !important;
}

.flex-el {
  flex-basis: 50%;
}

</style>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
