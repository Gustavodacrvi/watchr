<template>
  <div
    class="Comments popup cb shadow rb"
    :class="platform"
  >
    <div class="wrapper">
      <div class="messages">
        <Icon
          class="comment-background"
          icon='comment'
          color='var(--sidebar-color)'
          width='150px'
        />
      </div>
      <div class="editor rb">
        <div class="text">
          <textarea
            ref='input'
            placeholder="Comment..."
            class="txt scroll-thin"
            cols="2"
          >
          </textarea>
        </div>
        <div class="header">
          <div class="tools">
            <Icon
              class="cursor remove-highlight primary-hover"
              icon='file'
              title="Add file"
            />
          </div>
          <div class="btn">
            <button
              class="button rb"
            >
              Add comment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Icon from "@/components/Icon.vue"
import AuthButton from "@/components/Auth/Button.vue"

import { mapGetters } from 'vuex'

export default {
  components: {
    Icon, AuthButton,
  },
  props: ['payload'],
  mounted() {
    this.focus()
  },
  methods: {
    focus() {
      const inp = this.$refs.input
      if (inp)
        inp.focus()
    },
  },
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
  position: relative;
}

.editor {
  border: 2px solid var(--sidebar-color);
  display: flex;
  flex-direction: column;
  padding: 0 13px;
}

.text {
  padding: 8px 0;
  box-sizing: border-box;
}

.header {
  flex-basis: 45px;
  border-top: 2px solid var(--sidebar-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.txt {
  width: 100%;
  height: 100%;
  resize: none;
  outline: none;
}

.comment-background {
  position: absolute;
  left: 50%;
  top: 55%;
  transform: translate(-50%,-50%);
  opacity: .6;
}

.button {
  background-color: var(--sidebar-color);
  padding: 8px;
  transition-duration: .2s;
}

.button:hover {
  background-color: var(--light-gray);
}

</style>
