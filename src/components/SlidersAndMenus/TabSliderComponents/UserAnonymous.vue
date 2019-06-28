<template>
  <div class='content'>
    <p class='txt'> CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT CONTENT</p>    
    <form-button :waiting-response='waitingResponse'>
      Use anonymously
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
export default class SlideAnonymous extends Vue {

  waitingResponse: boolean = false
}

</script>

<style scoped>

.content {
  margin: 16px;
  height: 100%;
}

</style>
