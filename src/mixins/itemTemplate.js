
import ItemTemplate from "@/components/View/Item/Components/ItemTemplate.vue"

import { mapState, mapGetters } from "vuex"

export default {
  components: {
    ItemTemplate,
  },
  props: ['sidebarRenderer', 'newItemsObj', 'changingView'],
  methods: {
    selectItem() {
      this.$refs.template.selectItem()
    },
  },
  computed: {
    ...mapState(['userInfo', 'viewType', 'viewName']),
    
    isNewItem() {
      return this.item && this.newItemsObj && this.newItemsObj[this.item.id]
    },
  },
}
