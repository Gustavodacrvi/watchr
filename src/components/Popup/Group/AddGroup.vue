<template>
  <PopupTemplate
    comp='GroupEdit'
    routeType='group'
    errMsg='This group already exists!'

    :item='payload'
    :save='save'
    :otherItems='$store.state.group.groups'
  />
</template>

<script>

import mixin from "@/mixins/popupTemplate.js"

export default {
  mixins: [mixin],
  methods: {
    save(item) {
      if (this.payload)
        this.$store.dispatch('group/saveGroup', item)
      else
        this.$store.dispatch('group/addGroup', item)
    },
  },
}

</script>

