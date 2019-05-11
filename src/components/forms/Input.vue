<template>
  <div class='inputContainer form-element'>
    <div>
      <div class='input-box'>
        <input class='input-el' :class='[wrongInput, $store.state.theme.style]' :name='name' :placeholder='placeholder' :type='inputType' autocomplete='off' v-model='value'/>
        <icon class='pointer' @click='togglePassword' v-show='isPassword && visiblePassword' sz='medium' ico='eye'></icon>
        <icon class='pointer' @click='togglePassword' v-show='isPassword && !visiblePassword' sz='medium' ico='eye-slash'></icon>
      </div>
      <alert type='error' v-show='errorType === "emptyValue"'>This field cannot be empty.</alert>
      <alert type='error' v-show='errorType === "reachedMaxCharacters"'>Reached maximum number of characters.</alert>
      <alert type='error' v-show='errorType === "errorMsg"'>{{ this.error }}</alert>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Alert from './../generalComponents/Alert.vue';
import Icon from './../generalComponents/Icon.vue';

import { FormBus } from './Form.vue';
import { FormLogObject, InputErrorObject } from './../interfaces';


export default Vue.extend({
  components: {
    alert: Alert,
    icon: Icon,
  },
  props: {
    name: String,
    placeholder: String,
    max: Number,
    type: String,
    busEvent: String,
  },
  data() {
    return {
      value: undefined,
      errorType: null as any,
      inputType: this.type as string,
      error: '' as string,
      visiblePassword: false as boolean,
      eventName: undefined as any,
    };
  },
  created() {
    if (this.busEvent) {
      this.eventName = this.busEvent;
    } else {
      this.eventName = 'errorLog';
    }

    FormBus.$emit(this.eventName, {
      name: this.name,
      value: undefined,
      error: true,
    } as FormLogObject);
    FormBus.$on('error', (obj: InputErrorObject) => {
      if (obj.name === this.name) {
        this.errorType = 'errorMsg';
        this.error = obj.msg;
      }
    });
  },
  methods: {
    togglePassword(): void {
      this.visiblePassword = !this.visiblePassword;
      if (this.visiblePassword) {
        this.inputType = 'text';
      } else {
        this.inputType = 'password';
      }
    },
  },
  computed: {
    logObject(): object {
      const val: any = this.value;
      let hasError: boolean = false;
      if (val === '') {
        this.errorType = 'emptyValue';
        hasError = true;
      } else if (val.length > this.max) {
        this.errorType = 'reachedMaxCharacters';
        hasError = true;
      } else {
        this.errorType = null;
      }

      return {
        name: this.name,
        value: this.value,
        error: hasError,
      };
    },
    wrongInput(): object {
      return [
        (this.errorType === null) ? '' : 'wrong-input ' + this.$store.state.style,
      ];
    },
    isPassword(): boolean {
      return (this.type === 'password');
    },
  },
  watch: {
    value(): void {
      FormBus.$emit(this.eventName, this.logObject);
    },
  },
  beforeDestroy() {
    FormBus.$off('error');
  },
});
</script>

<style scoped>
.input-el.dark {
  background-color: #363636;
  color: #9C9696;
}

.wrong-input.dark {
  background-color: #363636 !important;
}

.input-el.light {
  background-color: #F1F1F3;
}

.wrong-input.light {
  background-color: #fdfde8 !important;
}

.input-el {
  box-sizing: border-box;
  width: 100%;
}

.form-margin {
  margin: 4px 0;
}

.inputContainer > div {
  width: 90%;
  margin: auto;
}

.input-box {
  position: relative;
}

.icon {
  position: absolute;
  top: 8px;
  right: 8px;
}


.input-el {
  position: relative;
  border: none;
  border-radius: 6px;
  padding: 8px;
  outline: none;
  font-family: 'Work Sans';
  font-size: 1.01em;
  transition-duration: .2s;
  bottom: 0;
}

.wrong-input {
  border: 2px solid #ecec4b !important;
  box-shadow: 0 0 2px #A97CFC;
}

.input-el:focus {
  border: 2px solid #A97CFC;
}
.input-el::placeholder {
  color: #9d9595;
}


@media screen and (max-width: 801px) {
  .inputContainer > div {
    width: 90%;
  }
}

</style>
