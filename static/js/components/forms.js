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

Vue.component('form-input', {
  props: {
    max: Number,
    placeholder: String,
    name: String,
  },
  data() {
    return {
      val: '',
      empty: undefined,
      error: undefined,
      errorType: undefined,
    }
  },
  template: `
    <div class='form-input form-el'>
      <div>
        <input v-model='val' :class='{ input: true, round: true, "wrong-input": error}' autocomplete='off' type='text' :placeholder='placeholder' :name='name' />
        <alert v-if='error && errorType === "empty"'>
          This field cannot be empty.
        </alert>
        <alert v-if='error && errorType === "max"'>
          The field has to be less than {{ max + 1 }} characters.
        </alert>
      </div>
    </div>
  `,
  watch: {
    val() {
      if (this.val === '') {
        this.error = true
        this.errorType = 'empty'
      } else if (this.val.length > this.max) {
        this.error = true
        this.errorType = 'max'
      }
      else this.error = false
    }
  },
})

Vue.component('card-form', {
  props: {
    act: String
  },
  template: `
    <div class='card-form'>
      <div class='card round'>
        <slot></slot>
      </div>
    </div>
  `,
})