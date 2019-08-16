<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Edit smart perspective</h3>
    </div>
    <div class='content'>
      <div class='flex margin'>
        <form-checkbox
          name='Always show labels'
          v-model='alwaysShowLabels'
        />
        <form-checkbox
          name='Always show edit dates'
          v-model='alwaysShowEditDate'
        />
        <form-checkbox
          name='Always show creation dates'
          v-model='alwaysShowCreationDate'
        />
      </div>
      <button
        class='button round-border margin'
        @click='save'
      >Save changes</button>
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

const perspectiveModule = namespace('perspective')

import { Alert, Perspective } from '../../interfaces/app'
import { IndexState, IndexGetters, IndexMutations } from '../../interfaces/store/index'
import { PersState, PersActions } from '../../interfaces/store/perspective'

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
export default class EditSmartPerspectivePopup extends Vue {
  @State('popUpPayload') pers!: IndexState.popUpPayload
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation pushAlert!: IndexMutations.PushAlert
  @Mutation pushPopUp!: IndexMutations.PushPopUp

  @perspectiveModule.State perspectives!: PersState.perspectives
  @perspectiveModule.Action saveSmartPerspective!: PersActions.SaveSmartPerspective

  alwaysShowLabels: boolean = true
  alwaysShowEditDate: boolean = true
  alwaysShowCreationDate: boolean = true

  created() {
    this.alwaysShowLabels = this.pers.alwaysShowTaskLabels
    this.alwaysShowEditDate = this.pers.alwaysShowLastEditDate
    this.alwaysShowCreationDate = this.pers.alwaysShowCreationDate
  }

  save() {
    this.saveSmartPerspective({
      alwaysShowTaskLabels: this.alwaysShowLabels,
      alwaysShowCreationDate: this.alwaysShowCreationDate,
      alwaysShowLastEditDate: this.alwaysShowEditDate,
      id: this.pers.id,
    })
    this.pushPopUp('')
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
