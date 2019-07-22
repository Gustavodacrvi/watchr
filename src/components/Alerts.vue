<template>
  <div class='wrapper'>
    <div
      class='alert card round-border'
      :class='[theme, alert.type, platform]'
    >
      <span
        class='txt'
        :class='theme'
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
  z-index: 999;
}

.alert.mobile {
  max-width: 320px;
}

.alert.desktop {
  max-width: 700px;
}

.alert.error {
  border: 2px solid #83B7E2;
}

.alert.success {
  border: 2px solid #70FF66;
}

.alert.warning {
  border: 2px solid #FFE366;
}

.btn {
  margin-top: 10px;
}

</style>
