
<template>
  <PopupTemplate
    comp='TagEdit'
    routeType='tag'
    errMsg='This tag already exists!'

    :item='payload'
    :save='save'
    :otherItems='$store.getters["tag/tags"]'
  />
</template>

<script>

import mixin from "@/mixins/popupTemplate.js"

export default {
  mixins: [mixin],
  methods: {
    save(item) {
      this.$store.dispatch('tag/saveTag', item)
    },
  },
}

</script>


