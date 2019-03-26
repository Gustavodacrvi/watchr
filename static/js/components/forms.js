function parseInputObj(map_iterable) {
  let str = ''
  for (let input of map_iterable) {
    str += input.name + '=' + input.value + '&'
  }
  return str.slice(0, -1)
}

Vue.component('form-title', {
  template: `
    <div class='form-title form-el'>
      <heading :lvl='1'><slot></slot></heading>
    </div>
  `,
})

Vue.component('alert', {
  template: `
    <txt class='alert'><slot></slot></txt>
  `,
})

Vue.component('card-form', {
  props: ['act'],
  data() {
    return {
      map: new Map(),
      httpSent: false,
      inputName: undefined,
      error: undefined,
    }
  },
  template: `
    <div class='card-form'>
      <div class='round card'>
        <slot></slot>
      </div>
    </div>
  `,
  methods: {
    cleanErrors() {
      this.inputName = undefined
      this.error = undefined
    }
  }
})

Vue.component('form-success', {
  template: `
    <div class='form-el form-success main-color form-left-text'>
      <txt form-left-text><slot></slot></txt>
    </div>
  `
})

Vue.component('form-error', {
  template: `
    <div class='form-el form-error form-left-text'>
      <txt class='form-left-text'><slot></slot></txt>
    </div>
  `
})

Vue.component('form-button', {
  template: `
    <div class='form-button form-el'>
      <btn class='round text' @click='analise' :disabled='$parent.httpSent'>
        <ftaw v-if='$parent.httpSent' class='fa fa-sync fa-spin white'></ftaw>
        <template v-else>
          <slot></slot>
        </template>
      </btn>
    </div>
  `,
  computed: {
    ajax() {
      return (typeof this.$parent.act === 'string')
    },
  },
  methods: {
    hasClientErrors() {
      let form = this.$parent
      for (let input of form.map.values()) {
        if (this.isTextInput(input) && input.value === '') {
          form.inputName = input.name
          form.error = 'formInputEmpty'
          return true
        }
        if (this.isCheckbox(input) && input.hasError) {
          form.inputName = input.name
          form.error = ''
          return true
        }
        if (input.hasError) {
          return true
        }
      }
      return false
    },
    isCheckbox(input) {
      return (input.type === 'checkbox')
    },
    isTextInput(input) {
      return (input.type === 'password' || input.type === 'text' || input.type === 'confirmpassword')
    },
    sendAjax() {
      let form = this.$parent
      form.httpSent = true
      POSTrequestData(form.act, parseInputObj(form.map.values()), (dt) => {
        let data = JSON.parse(dt)
        if (data.valid) {
          window.location.href = "/login"
        } else {
          form.inputName = data.inputName
          form.error = data.error
        }
        form.httpSent = false
      })
    },
    analise() {
      if (!this.hasClientErrors()) {
        if (this.ajax) {
          this.sendAjax()
        } else this.$parent.act(map.values())
      }
    },
  },
})

Vue.component('form-input', {
  props: {
    max: Number,
    placeholder: String,
    name: String,
    type: String,
  },
  data() {
    return {
      val: '',
      empty: undefined,
      error: undefined,
      errorType: undefined,
      showing: true,
      isPassword: undefined,
    }
  },
  created() {
    if (this.isPasswordType) this.showing = false
    else this.showing = true

    this.isPassword = !this.showing
    let obj = this.getInputObj()
    this.$parent.map.set(this.name, obj)
  },
  template: `
    <div class='form-input form-el'>
      <div>
        <input v-model='val' class='form-input' :class='{ input: true, round: true, "wrong-input": error || hasFormError}' autocomplete='off' :type='inputType' :placeholder='placeholder' :name='name' :ref='name' />
        <alert v-if='hasErrorType("empty")'>
          {{ $root.l.formInputEmpty }}
        </alert>
        <alert v-else-if='hasErrorType("max")'>
          {{ getFormInputErrorMsg(max + 1) }}
        </alert>
        <alert v-else-if='hasErrorType("passwords not matching")'>
          {{ $root.l.formInputPasswordNotMatching }}
        </alert>
        <alert v-else-if='hasFormError'>
          {{ $root.l[$parent.error] }}
        </alert>
        <template v-if='isPasswordType'>
          <ftaw v-if='showing' @click='showing = false' class='fa fa-eye tine-icon'></ftaw>
          <ftaw v-if='!showing' @click='showing = true' class='fa fa-eye-slash tine-icon'></ftaw>
        </template>
      </div>
    </div>
  `,
  computed: {
    isPasswordType() {
      return (this.type === 'password' || this.type === 'confirmpassword')
    },
    inputType() {
      if (this.showing) return "text"
      else return "password"
    },
    hasFormError() {
      return (this.$parent.inputName === this.name)
    },
  },
  methods: {
    getFormInputErrorMsg(max) {
      let l = this.$root.l.lang
      if (l === 'pt-BR')
        return 'O número de caracteres deve ser menor que ' + max + '.' 
      else if (l === 'en')
        return 'The number of characters must be less than ' + max + '.'
    },
    hasErrorType(str) {
      return (this.error && this.errorType === str)
    },
    getInputObj() {
      return { 
        hasError: true,
        value: this.val.trim(),
        isPassword: this.isPassword,
        name: this.name,
        type: this.type,
      }
    },
  },
  watch: {
    val() {
      let form = this.$parent
      if (this.hasFormError) {
        form.cleanErrors()
      }
      let obj = this.getInputObj()
      if (this.type === 'password') {
        form.passwordValue = this.val
      }
      if (this.val.trim() === '') {
        this.error = true
        this.errorType = 'empty'
      } else if (this.val.trim().length > this.max) {
        this.error = true
        this.errorType = 'max'
      } else if (this.type === 'confirmpassword' && this.val.trim() !== form.passwordValue) {
        this.error = true
        this.errorType = 'passwords not matching'
      }
      else {
        obj.hasError = false
        this.error = false
      }
      form.map.set(this.name, obj)
    },
  },
})

Vue.component('form-link', {
  props: {
    to: String
  },
  template: `
    <div class='form-el'>
      <a class='blue-link form-left-text text' :href='to'><slot></slot></a>
    </div>
  `,
})

Vue.component('form-checkbox', {
  props: {
    initial: Boolean,
    mustbe: String,
    name: String,
    errormsg: String,
  },
  data() {
    return {
      state: this.initial,
      error: this.hasError()
    }
  },
  created() {
    this.error = this.hasError()
    this.$parent.map.set(this.name, this.getInputObj())
  },
  template: `
    <div class='form-el form-checkbox'>
      <div>
        <txt class='form-left-text'><slot></slot></txt>
        <div class='transparent-border-card' @click='state = !state'>
          <ftaw v-show='state' class='fa fa-check'></ftaw>
        </div>
      </div>
      <alert class='form-left-text' v-show='hasFormError'>
        {{ this.errormsg }}
      </alert>
    </div>
  `,
  computed: {
    hasFormError() {
      return (this.$parent.inputName === this.name)
    },
  },
  methods: {
    hasError() {
      if (this.mustbe === 'false' || this.mustbe === 'true') {
        if (this.mustbe === 'false' && this.state)
          return true
        else if (this.mustbe === 'true' && !this.state)
          return true
        else return false
      } else
        return false
    },
    getInputObj() {
      return {
        value: this.state,
        hasError: this.error,
        name: this.name,
        type: 'checkbox',
      }
    },
  },
  watch: {
    state() {
      if (this.hasFormError) {
        this.$parent.cleanErrors()
      }
      this.error = this.hasError()
      this.$parent.map.set(this.name, this.getInputObj())
    }
  },
})
