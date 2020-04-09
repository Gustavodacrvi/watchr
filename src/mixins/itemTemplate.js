

export default {
  props: ['newItemsObj'],
  computed: {
    isNewItem() {
      return this.item && this.newItemsObj[this.item.id]
    },
  },
}
