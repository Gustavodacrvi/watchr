<template>
  <div class='subtask-adder'>
    <transition name='fade' mode='out-in'>
      <div v-if='addingSubtask || onlyEdit' key='adding' class='adding-wrapper'>
        <div class='adding'>
          <drop-input
            class='subtask-input'
            type='text'
            placeholder='Subtask...'
            focus-class='subtask-edit-focus-class'
            :disabled='true'
            :input='val'
            :values='[]'
            :input-theme='theme'
            :max='200'
            @enter='add'
            @value='v => val = v'
          />
        </div>
        <form-btn class='tiny' @click='add'>Add subtask</form-btn>
        <span class='txt cancel pointer' :class='theme' @click='addingSubtask = false;cancel()'>Cancel</span>
      </div>
      <div v-else key='not-adding' class='txt add-subtask not-adding' :class='theme' @click='addingSubtask = true'>
        <i class='fas fa-plus fa-sm'></i>
        <span>Add subtask</span>
      </div>
    </transition>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import DropdownInput from '@/components/DropdownInput.vue'
import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'drop-input': DropdownInput,
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

  focus() {
    const el = document.querySelectorAll('.subtask-edit-focus-class')[0] as any
    el.focus()
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
  @Watch('addingSubtask')
  onChange2() {
    setTimeout(() => {
      if (this.addingSubtask)
        this.focus()
    }, 500)
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

.add-subtask {
  cursor: pointer;
  transition: color .3s;
}

.add-subtask:hover {
  color: #ff6b66;
}

.not-adding {
  margin: 6px;
}

.not-adding .fas {
  margin-right: 10px;
}

</style>
