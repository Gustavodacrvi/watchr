
<template>
  <div class="Profile">
    <div class="margin">
      <ButtonApp
        type="card"
        :class="{white: user.displayName}"
        style='margin-top: 0'
        :value="displayName"
        @click="addDisplayName"
      />
      <ButtonApp
        type="card"
        class="white"
        style='margin-top: 0'
        :value="user.email"
        @click="changeEmail"
      />
      <h3>{{ l['Options'] }}</h3>
      <h4>{{ l['Appnav'] }}</h4>
    </div>
    <CheckboxApp v-for="s in sections" :key="s.name"
      :name="l[s.name]"
      :value='!isHided(s.name)'
      :icon='s.icon'
      @input='toggleSection(s.name)'
    />
    <div class="margin" style="margin-top: 10px;">
      <ButtonApp :value="l['Save options']" @click="save"/>
    </div>
  </div>
</template>

<script>

import ButtonVue from '../Auth/Button.vue'
import CheckboxApp from '../Auth/Checkbox.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['content'],
  components: {
    CheckboxApp,
    ButtonApp: ButtonVue,
  },
  data() {
    return {
      sections: [
        {
          name: 'Lists',
          icon: 'tasks',
        },
        {
          name: 'Tags',
          icon: 'tags',
        }
      ],
      hidedSections: [],
    }
  },
  created() {
    this.hidedSections = this.userHidedSections
  },
  methods: {
    toggleSection(name) {
      if (this.isHided(name)) {
        const i = this.hidedSections.findIndex(el => el === name)
        this.hidedSections.splice(i, 1)
      } else this.hidedSections.push(name)
    },
    isHided(name) {
      return this.hidedSections.includes(name)
    },
    reload() {
      window.location.reload()
    },
    pop(popup) {
      this.$store.dispatch('pushPopup', popup)
    },
    addDisplayName() {
      this.pop({
        comp: 'ChangeUsername',
        callback: this.reload,
      })
    },
    changeEmail() {
      this.pop({
        comp: 'ChangeEmail',
        callback: this.reload,
      })
    },
    save() {
      if (this.hidedSections.length === 2) {
        this.$store.commit('pushToast', {
          name: this.l['Please toggle at least one section.'],
          seconds: 4,
          type: 'error',
        })
      } else {
        this.$store.dispatch('update', {
          ...this.user,
          hidedSections: this.hidedSections,
        })
      }
    },
  },
  computed: {
    ...mapState(['user', 'userInfo']),
    ...mapGetters(['l']),
    userHidedSections() {
      if (this.userInfo.hidedSections) return this.userInfo.hidedSections.slice()
      return []
    },
    displayName() {
      if (this.user.displayName) return this.user.displayName
      return this.l['Add username']
    },
  },
}

</script>

<style scoped>

.Profile {
  width: 350px;
}

.margin {
  margin: 0 20px;
}

</style>
