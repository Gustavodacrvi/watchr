Vue.component('form-title', {
  template: `
    <h1 class='form-title form-el'><slot></slot></h1>
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
    }
  },
  template: `
    <div class='form-input form-el'>
      <input v-model='val' class='input round' autocomplete='off' type='text' :placeholder='placeholder' :name='name' />
    </div>
  `,
  watch: {
    val() {
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