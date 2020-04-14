
import ItemTemplate from "@/components/View/Item/Components/ItemTemplate.vue"

export default {
  components: {
    ItemTemplate,
  },
  props: ['newItemsObj', 'changingView'],
  methods: {
    selectItem() {
      this.$refs.template.selectItem()
    },
  },
  computed: {
    isNewItem() {
      return this.item && this.newItemsObj[this.item.id]
    },
  },
}
