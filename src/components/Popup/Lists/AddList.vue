<template>
  <PopupTemplate
    comp='ListEdit'
    routeType='list'
    errMsg='This list already exists!'

    :item='payload'
    :save='save'
    :otherItems='$store.getters["list/allLists"]'
  />
</template>

<script>

import mixin from "@/mixins/popupTemplate.js"

export default {
  mixins: [mixin],
  methods: {
    save(item) {
      this.$store.dispatch('list/saveList', item)
    },
  },
}

</script>
