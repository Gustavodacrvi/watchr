<template>
  <div
    class="Comments popup cb shadow rb"
    :class="platform"
  >
    <div class="wrapper">
      <div class="messages">
        fsd
      </div>
      <div class="editor">
        asdf
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  props: ['payload'],
  computed: {
    ...mapGetters({
      platform: 'platform',
      getGroupsById: 'group/getGroupsById',
    }),
    group() {
      return this.getGroupsById([this.payload.groupId])[0]
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Comments {
  position: relative;
}

.Comments.desktop {
  min-height: 500px;
}

.wrapper {
  display: flex;
  padding: 12px;
  position: absolute;
  width: 100%;
  height: 100%;
  flex-direction: column;
}

.messages {
  flex-basis: 100%;
}

.editor {
  flex-basis: 160px;
}

</style>
