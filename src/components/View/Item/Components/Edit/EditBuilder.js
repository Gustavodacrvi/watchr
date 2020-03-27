

import InputDrop from "@/components/Auth/DropInput.vue"

export default (model, textFields) => ({
  data() {
    return {
      model,
    }
  },
  render(create) {
    return create('div', {class: 'EditBuilter'}, [
      create('div', {class: 'text-fields'}, 
        textFields.map(el => 
          create(InputDrop, {
            class: 'field no-back',
            props: el.props,
          })
        )
      )
    ])
  },
})
