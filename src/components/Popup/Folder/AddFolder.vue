<template>
  <PopupTemplate
    comp='FolderEdit'
    routeType='folder'
    errMsg='This folder already exists!'

    :item='payload'
    :save='save'
    :otherItems='$store.getters["folder/folders"]'
  />
</template>

<script>

import mixin from "@/mixins/popupTemplate.js"

export default {
  mixins: [mixin],
  methods: {
    save(item) {
      this.$store.dispatch('folder/saveFolder', item)
    },
  },
}

</script>

