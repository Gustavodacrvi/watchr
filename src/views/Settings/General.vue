<template>
  <div>
    <h2>Date and Time</h2>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Time zone</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Date format</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Date format</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
    </div>
    <hr class='border themeatic-break hr' :class='theme'>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Start of the week</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Next week</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
    </div>
    <hr class='border themeatic-break hr' :class='theme'>
    <h2>Push notifications</h2>
    <div class='table'>
      <div class='line' :class='platform'>
        <div class='text'>
          <span class='txt'>Daily notification</span>
        </div>
        <div class='content'>
          <form-options
            :selected='selected'
            :options='options'
            max-height='100px'
            @select='v => selected = v'
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import FormOptions from '@/components/PopUps/FormComponents/FormOptions.vue'

@Component({
  components: {
    'form-options': FormOptions,
  },
})
export default class GeneralSubView extends Vue {
  @State theme!: string
  @Getter platform!: string
  
  selected: string = 'option 1'

  options: string[] = ['option 1', 'option 2', 'option 3', 'option 4']
}

</script>

<style scoped>

.hr {
  width: 95%;
}

.table {
  margin: 30px 0;
}

.line.desktop {
  display: flex;
}

.line + .line {
  margin-top: 10px;
}

.text {
  flex-basis: 50%;
  display: flex;
  align-items: center;
}

.content {
  flex-basis: 50%;
}

</style>
