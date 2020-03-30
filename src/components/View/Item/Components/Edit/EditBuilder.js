

import InputDrop from "@/components/Auth/DropInput.vue"

import { mapGetters, mapState } from 'vuex'

export default ({
  value,
  textFields,
  instance = {},
  props = [],
}) => ({
  props: ['item', 'value', ...props],
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
  methods: {
    ...(instance.methods || {}),
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      lists: 'list/sortedLists',
      folders: 'folder/sortedFolders',
      groups: 'group/sortedGroupsByName',
      tags: 'tag/sortedTagsByName',
    }),
    
    ...(instance.computed || {}),
  },
  watch: {
    value() {
      if (value) {
        value(this.value, this)
      }
    },
    
    ...(instance.watch || {}),
  },
})
