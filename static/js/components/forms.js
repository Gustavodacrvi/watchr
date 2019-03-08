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
      <h1><slot></slot></h1>
    </div>
  `,
})

Vue.component('alert', {
  template: `
    <span class='alert'><slot></slot></span>
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
      <div class='card round'>
        <slot></slot>
      </div>
    </div>
  `,
})

Vue.component('form-button', {
  template: `
    <div class='form-button form-el'>
      <button class='round' @click='analise'>
        <i v-if='$parent.httpSent' class='fa fa-sync fa-spin'></i>
        <template v-else>
          <slot></slot>
        </template>
      </button>
    </div>
  `,
  computed: {
    ajax() {
      return (typeof this.$parent.act === 'string')
    },
  },
  methods: {
    hasClientErrors() {
      for (let input of this.$parent.map.values()) {
        if (this.isTextInput(input) && input.value === '') {
          this.$parent.inputName = input.name
          this.$parent.error = 'This field cannot be empty.'
          return true
        }
        if (input.hasError) {
          return true
        }
      }
      return false
    },
    isTextInput(input) {
      return (input.type === 'password' || input.type === 'text' || input.type === 'confirmpassword')
    },
    sendAjax() {
      let form = this.$parent
      form.httpSent = true
      POSTrequestData(form.act, parseInputObj(form.map.values()), (dt) => {
        let data = JSON.parse(dt)
        if (!data.error) {
          // REDIRECT THIS SHIT BRUH
        } else {
          form.inputName = dt.inputName
          form.error = dt.error
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
  mounted() {
    if (this.isPasswordType) this.showing = false
    else this.showing = true

    this.isPassword = !this.showing
    let obj = this.getInputObj()
    this.$parent.map.set(this.name, obj)
  },
  template: `
    <div class='form-input form-el'>
      <div>
        <input v-model='val' :class='{ input: true, round: true, "wrong-input": error || hasHttpError}' autocomplete='off' :type='inputType' :placeholder='placeholder' :name='name' :ref='name' />
        <alert v-if='hasErrorType("empty")'>
          This field cannot be empty.
        </alert>
        <alert v-else-if='hasErrorType("max")'>
          The field has to be less than {{ max + 1 }} characters.
        </alert>
        <alert v-else-if='hasErrorType("passwords not matching")'>
          Passwords are not matching.
        </alert>
        <alert v-else-if='hasHttpError'>
          {{ $parent.error }}
        </alert>
        <template v-if='isPasswordType'>
          <i v-if='showing' @click='showing = false' class='fa fa-eye tine-icon'></i>
          <i v-if='!showing' @click='showing = true' class='fa fa-eye-slash tine-icon'></i>
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
    hasHttpError() {
      return (this.$parent.inputName === this.name)
    },
  },
  methods: {
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
      if (this.hasHttpError) {
        form.inputName = undefined
        form.error = undefined
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
