<template>
  <div class="AddTag popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['Share List'] }}</h2>
    </div>
    <div class="content">
      <div class="header">
        <span class="opt cursor" :class="{active: section === 'Colab'}" @click="activate('Colab')">{{ l['Collaborators'] }}</span>
        <span class="opt cursor" :class="{active: section === 'From'}" @click="activate('From')">{{ l['Invite from list'] }}</span>
        <span class="line"></span>
      </div>
      <div class="popup-cont">
        <transition name="fade-t" mode="out-in"> 
          <div v-if="section === 'Colab'" class="colab" key="colab">
            <div class="mt colab-invite">
              <div class="colab-input">
                <DropInput
                  :placeholder='l["E-mail or username"] + ":"'
                  :focus='true'
                  :value='email'
                  :options='options'
                  @input='v => email = v'
                  @select="select"
                  @cancel="$emit('close')"
                />
              </div>
              <div class="colab-btn">
                <ButtonApp :value="l['Invite']" @click="invite"/>
              </div>
            </div>
            <div class="mt">
              <transition
                @enter='enter'
                @leave='leave'
              >
                <ProfileInfo v-for="u in pendingUsers"
                  :key="u.userId"
                  :pending='true'
                  v-bind="u"
                  @remove='removePendingUser(u.userId)'
                />
              </transition>
            </div>
          </div>
          <div v-else class="from" key="from">
            from
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'
import ProfileInfoVue from '../../Profile/ProfileInfo.vue'

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  components: {
    DropInput: DropInputVue,
    ButtonApp: ButtonVue,
    ProfileInfo: ProfileInfoVue,
  },
  data() {
    return {
      section: 'Colab',
      email: '',
      options: [],
    }
  },
  mounted() {
    this.moveLine()
  },
  methods: {
    select(val) {

    },
    activate(name) {
      this.section = name
    },
    moveLine() {
      const act = this.$el.getElementsByClassName('active')[0]
      const line = this.$el.getElementsByClassName('line')[0]
      const s = line.style

      s.width = act.offsetWidth + 'px'
      s.left = act.offsetLeft + 'px'
    },
    invite() {
      const toast = t => this.$store.commit('pushToast', t)
      const errToast = err => toast({
        name: err.message,
        seconds: 4,
        type: 'error',
      })
      let userInfo = null
      if (this.email)
        firebase.firestore().collection('users')
        .where('email', '==', this.email)
        .where('emailVerified', '==', true)
        .get({source: 'server'}).then(res => {
          res.docs.forEach(el => {
            userInfo = el.data()
          })
          if (this.list.userId !== userInfo.userId)
            this.$store.dispatch('list/addPendingUser', {
              listId: this.list.id,
              userInfo,
            })
        }).catch(errToast)
    },
    removePendingUser(id) {
      this.$store.dispatch('list/removePendingUser', {
        listId: this.list.id,
        userId: id,
      })
    },
    enter(el) {
      const s = el.style

      s.transitionDuration = '0s'
      s.height = 0
      s.opacity = 0
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.height = '40px'
        s.opacity = 1
      })
    },
    leave(el) {
      const s = el.style
      s.height = 0
      s.opacity = 0
    },
  },
  computed: {
    ...mapGetters(['platform', 'l']),
    ...mapState({
      user: state => state.user,
      lists: state => state.list.lists,
      listId: state => state.popup.payload,
    }),
    list() {
      return this.lists.find(el => el.id === this.listId)
    },
    usersData() {
      if (this.list.userData)
        return Object.values(this.list.userData)
      return []
    },
    pendingIds() {
      if (!this.list.pending) return []
      return Object.keys(this.list.pending)
    },
    pendingUsers() {
      if (!this.list.pending) return []
      const arr = []
      for (const id of this.pendingIds) {
        const user = this.usersData.find(el => el.userId === id)
        if (user) arr.push(user)
      }
      return arr
    },
  },
  watch: {
    name() {

    },
    section() {
      setTimeout(() => {
        this.moveLine()
      })
    }
  }
}

</script>

<style scoped>

.header {
  height: 45px;
  display: flex;
  align-items: center;
  position: relative;
}

.line {
  position: absolute;
  height: 2px;
  background-color: var(--primary);
  bottom: 0;
  left: 0;
  border-radius: 4px;
  transition-duration: .2s;
}

.colab-invite {
  display: flex;
  align-items: center;
}

.colab-input {
  flex-basis: 65%;
}

.colab-btn {
  margin-left: 8px;
  flex-basis: 35%;
}

.opt {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--light-gray);
  height: 100%;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  color: var(--gray);
  transition-duration: .2s;
}

.opt:hover {
  background-color: var(--light-gray);
  color: var(--white);
}

.opt.active {
  color: var(--primary);
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
