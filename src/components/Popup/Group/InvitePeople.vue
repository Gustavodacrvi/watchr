<template>
  <div class="addFolder popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">Invite users</h3>
    </div>
    <div class="content">
      <span class="note">
        Type in the name of the person you want to share with. If it’s someone you’ve never shared a list with before, you’ll need to type in the email associated with their account. 
      </span>
      <DropInput class="input"
        placeholder='E-mail or username:'
        v-model="name"
        :focus='true'
        :options='options'
        @cancel='$emit("close")'
      />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

import DropInput from '@/components/Auth/DropInput.vue'

export default {
  components: {
    DropInput,
  },
  data() {
    return {
      name: '',
    }
  },
  computed: {
    ...mapGetters({
      platform: 'platform',
    }),
    ...mapState({
      groupId: state => state.popup.payload,
      groups: state => state.group.groups,
      userInfo: state => state.userInfo,
    }),
    group() {
      return this.groups.find(el => el.id === this.groupId)
    },
    pastShared() {
      if (!this.userInfo.pastShared)
        return []
      return Object.keys(this.userInfo.pastShared).map(k => this.userInfo.pastShared[k])
    },
    options() {
      return this.pastShared.filter(user => user.displayName.toLowerCase().includes(this.name.toLowerCase()))
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.note {
  opacity: .6;
}

.input {
  margin: none;
  margin-top: 6px;
}

</style>
