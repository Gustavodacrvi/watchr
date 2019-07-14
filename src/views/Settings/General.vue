<template>
  <div>
    <h2>Date and Time</h2>
    <form-options
      :selected='selected'
      :options='options'
      max-height='300px'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

import FormOptions from '@/components/PopUps/FormComponents/FormOptions.vue'

@Component({
  components: {
    'form-options': FormOptions,
  },
})
export default class GeneralSubView extends Vue {
  selected: string = 'option 1'

  options: string[] = ['option 1', 'option 2', 'option 3', 'option 4']
}

</script>
