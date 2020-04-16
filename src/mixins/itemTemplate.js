
import ItemTemplate from "@/components/View/Item/Components/ItemTemplate.vue"

import { mapState } from "vuex"

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
    ...mapState(['userInfo']),
    
    isNewItem() {
      return this.item && this.newItemsObj[this.item.id]
    },
  },
}
