

import InputDrop from "@/components/Auth/DropInput.vue"

// model, textFields, instance = {},props = []

export default ({
  textFields,
  instance = {},
  props = [],
}) => ({
  props: ['item', ...props],
  data() {
    return {
      currentPrefix: '',
      ...(instance.data ? instance.data() : {}),
    }
  },
  created() {
    if (this.item)
      this.model = {...this.model, ...this.item}
  },
  methods: {
    ...(instance.methods || {}),
  },
  computed: {
    ...(instance.computed || {}),
  },
  render(create) {
    return create('div', {
      class: 'EditBuilder',
      on: {
        click: evt => evt.stopPropagation(),
        pointerdown: evt => evt.stopPropagation(),
      },
    }, [
      create('div', {class: 'text-fields'}, 
        textFields.map(el =>
          create(InputDrop, {
            class: 'field no-back',
            props: el.props,

            domProps: {
              value: this.model[el.vModel],
              options: el.options ? this[el.options] : [],
            },
            on: {
              input(event) {
                this.$emit('input', event.target.value)
              },
            },
          })
        )
      )
    ])
  },
})
