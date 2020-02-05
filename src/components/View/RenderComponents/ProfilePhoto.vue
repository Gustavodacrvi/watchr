<template>
  <div
    class="ProfilePhoto"
    :class='{doesntHavePhoto: !url, edit: !display}'
    :style="{backgroundImage: `url('${url}')`, width: getProfileWidth, height: getProfileWidth}"
    @click='click'
  >
    <Icon v-if="!url"
      icon='user'
      color='var(--fade)'
      :width='getIconSize'
    />
  </div>
</template>

<script>

import Icon from "@/components/Icon.vue"

import utils from '@/utils'

import { mapState } from 'vuex'

import firebase from 'firebase/app'
import 'firebase/storage'

const sto = firebase.storage()

export default {
  props: ['photoURL', 'size', 'display', 'stopAuthFallback'],
  components: {
    Icon,
  },
  mounted() {
    this.bindContext()
  },
  methods: {
    bindContext() {
      if (!this.display)
        utils.bindOptionsToEventListener(this.$el, this.options, this, 'click')
    },
    click(evt) {
      if (!this.display)
        evt.stopPropagation()
    },
    removePhoto() {
      this.$store.dispatch('deleteProfilePic')
    },
    async changePhoto(files) {
      const f = files[0]
      if (f) {
        const str = `images/${this.user.uid}`
        try {
          await sto.ref(str).put(f, {
            contentType: f.type,
          })
          const url = await sto.ref(str).getDownloadURL()
          await this.$store.dispatch('updateProfilePic', url)
          this.$store.commit('pushToast', {
            name: 'Successfully updated profile photo.',
            seconds: 3,
            type: 'success',
          })
        } catch (err) {
          sto.ref(str).delete()
          this.$store.commit('pushToast', {
            name: err.message,
            seconds: 3,
            type: 'error',
          })
        }
      }
    },
  },
  computed: {
    ...mapState(['user']),
    url() {
      if (this.stopAuthFallback)
        return this.photoURL
      return this.photoURL || this.user.photoURL || this.getProviderPhotoURL
    },
    options() {
      const opt = [
        {
          name: 'Change photo',
          file: true,
          accept: 'image/*',
          handleFiles: this.changePhoto,
        },
      ]
      if (this.url)
        opt.push({
          name: 'Remove photo',
          callback: () => this.removePhoto()
        })
      if (!this.display)
        return opt
    },
    getIconSize() {
      switch (this.size) {
        case 'normal': return '28px'
      case 'small': return '17px'
        default: return '12px'
      }
    },
    getProfileWidth() {
      switch (this.size) {
        case 'normal': return '75px'
        case 'small': return '35px'
        case 'ultra-small': return '23px'
        default: return '75px'
      }
    },
    getProviderPhotoURL() {
      return this.user && this.user.providerData && this.user.providerData.map(el => el.photoURL)[0]
    },
  },
}

</script>

<style scoped>

.ProfilePhoto {
  border-radius: 1000px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-position: center;
  background-size: cover;
}

.edit {
  cursor: pointer;
}

.doesntHavePhoto {
  background-color: var(--sidebar-color);
}

</style>
