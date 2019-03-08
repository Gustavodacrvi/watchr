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
  props: {
    act: String
  },
  data() {
    return {
      map: new Map()
    }
  },
  template: `
    <div class='card-form'>
      <div class='card round'>
        <slot></slot>
      </div>
    </div>
  `,
  watch: {
    map() {
      console.log(this.map.values())
    }
  }
})

Vue.component('form-button', {
  props: {

  },
  template: `
    <div class='form-button form-el'>
      <button class='round' @click='analise'><slot></slot></button>
    </div>
  `,
  methods: {
    analise() {
      let map = this.$parent.map
      let results = map.values()
      let send = true
      for (input of results) {
        if (input.hasError)
          send = false
      }

      if (send) this.$emit('send')
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
    if (this.type === 'password') this.showing = false
    else this.showing = true
    this.isPassword = !this.showing
    let obj = { 
      hasError: true,
      value: '',
      isPassword: this.isPassword,
    }
    this.$parent.map.set(this.name, obj)
  },
  template: `
    <div class='form-input form-el'>
      <div>
        <input v-model='val' :class='{ input: true, round: true, "wrong-input": error}' autocomplete='off' :type='inputType' :placeholder='placeholder' :name='name' />
        <alert v-if='error && errorType === "empty"'>
          This field cannot be empty.
        </alert>
        <alert v-if='error && errorType === "max"'>
          The field has to be less than {{ max + 1 }} characters.
        </alert>
        <template v-if='type === "password"'>
          <i v-if='showing' @click='showing = false' class='fa fa-eye tine-icon'></i>
          <i v-if='!showing' @click='showing = true' class='fa fa-eye-slash tine-icon'></i>
        </template>
      </div>
    </div>
  `,
  computed: {
    inputType() {
      if (this.showing) return "text"
      else return "password"
    },
  },
  watch: {
    val() {
      let obj = { 
        hasError: true,
        value: this.val,
        isPassword: this.isPassword,
      }
      if (this.val === '') {
        this.error = true
        this.errorType = 'empty'
      } else if (this.val.length > this.max) {
        this.error = true
        this.errorType = 'max'
      }
      else {
        obj.hasError = false
        this.error = false
      }
      this.$parent.map.set(this.name, obj)
    },
  },
})
