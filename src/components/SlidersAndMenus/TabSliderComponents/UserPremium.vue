<template>
  <div class='content'>
    <p class='txt' :class='theme'> CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT</p>
    <form-button :waiting-response='waitingResponse'>
      Create payed account
    </form-button>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'form-button': FormButton,
  },
})
export default class SlideCreateaccount extends Vue {

  waitingResponse: boolean = false
}

</script>

<style scoped>

.content {
  height: 100%;
  margin: 16px;
}

</style>
