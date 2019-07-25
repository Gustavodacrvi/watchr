<template>
  <div class='subtask-adder pointer'>
    <transition name='fade' mode='out-in'>
      <div v-if='addingSubtask' key='adding' class='adding-wrapper'>
        <div class='adding'>
          <form-input
            class='subtask-input'
            type='text'
            placeholder='Subtask...'
            v-model='val'
            :disabled='true'
            :focus='true'
            :keydown='true'
            :max='200'
            @enter="$emit('add')"
          />
        </div>
        <form-btn class='tiny' @click="$emit('add')">Add subtask</form-btn>
        <span class='txt cancel pointer' :class='theme' @click='addingSubtask = false'>Cancel</span>
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

  val: string = ''
  addingSubtask: boolean = false

  created() {
    this.val = this.value
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
