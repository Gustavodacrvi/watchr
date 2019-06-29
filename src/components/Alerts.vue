<template>
  <div class='wrapper'>
    <div
      class='alert card round-border'
      :class='[theme, alert.type, platform]'
    >
      <span
        class='txt'
        v-html='alert.name'
      ></span>
      <form-button v-if='alert.btn'
        class='btn'
        :waiting-response='false'
        @click='alert.callback'
      >
        {{ alert.btn }}
      </form-button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

import { Alert } from '@/interfaces/app'

@Component({
  components: {
    'form-button': FormButton,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @State alert!: Alert
  @Getter platform!: 'desktop' | 'mobile'
}

</script>

<style scoped>

.wrapper, .alert {
  display: flex;
}

.wrapper {
  justify-content: center;
  position: absolute;
  pointer-events: none;
  width: 100%;
  bottom: 0;
}

.alert {
  pointer-events: all;
  margin-bottom: 25px;
  padding: 16px;
  box-sizing: border-box;
  align-items: center;
  flex-direction: column;
  min-height: 55px;
  z-index: 100;
}

.alert.mobile {
  max-width: 320px;
}

.alert.desktop {
  max-width: 640px;
}

.alert.error {
  border: 1px solid #fc7d7d;
}

.alert.success {
  border: 1px solid #70FF66;
}

.alert.warning {
  border: 1px solid #FFE366;
}

.btn {
  margin-top: 10px;
}

</style>
