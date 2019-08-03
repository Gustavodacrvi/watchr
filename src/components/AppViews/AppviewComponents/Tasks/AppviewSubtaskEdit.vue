<template>
  <div class='subtask-adder'>
    <transition name='fade' mode='out-in'>
      <div v-if='addingSubtask || onlyEdit' key='adding' class='adding-wrapper'>
        <div class='adding'>
          <form-input
            class='subtask-input'
            type='text'
            placeholder='Subtask...'
            v-model='val'
            :disabled='true'
            :focus='true'
            :keydown='true'
            :input-theme='theme'
            :max='200'
            @enter='add'
          />
        </div>
        <form-btn class='tiny' @click='add'>Add subtask</form-btn>
        <span class='txt cancel pointer' :class='theme' @click='addingSubtask = false;cancel()'>Cancel</span>
      </div>
      <div v-else key='not-adding' class='txt not-adding' :class='theme' @click='addingSubtask = true'>
        <i class='fas fa-plus fa-sm'></i>
        <span>Add subtask</span>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'form-input': FormInput,
    'form-btn': FormButton,
  },
})
export default class SubtaskEdit extends Vue {
  @State theme!: string

  @Prop(String) value!: string
  @Prop(Boolean) onlyEdit!: boolean

  val: string = ''
  addingSubtask: boolean = false

  created() {
    this.val = this.value
  }

  add() {
    setTimeout(() => {
      this.$emit('add', this.val)
      this.val = ''
    }, 80)
  }
  cancel() {
    this.$emit('cancel')
    this.val = ''
  }

  @Watch('val')
  onChange() {
    this.$emit('input', this.val)
  }
}

</script>

<style scoped>

.adding {
  margin-bottom: 4px;
}

.cancel {
  margin-left: 4px;
  color: #FF6B66;
}

.not-adding {
  margin: 6px;
}

.not-adding .fas {
  margin-right: 10px;
}

</style>
