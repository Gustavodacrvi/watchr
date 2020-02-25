<template>
  <div
    class="Comments popup cb shadow rb"
    :class="layout"
  >
    <div class="wrapper">
      <div class="messages">
        <Icon
          class="comment-background"
          icon='comment'
          color='var(--sidebar-color)'
          width='150px'
        />
          <transition-group
            @enter='enter'
            @leave='leave'
            tag="div"
            class="comments scroll-thin"
            ref='wrapper'
          >
            <Comment v-for="c in groupCommentsReversed"
              class="comm"
              :key="c.id"
              :groupId='payload.groupId'
              v-bind="c"

              @delete='deleteComment(c.id)'
            />
          </transition-group>
      </div>
      <div class="editor rb">
        <div class="text">
          <textarea
            ref='input'
            placeholder="Comment..."
            class="txt scroll-thin"
            cols="2"

            v-model="comment"
            @keydown="keydown"
          >
          </textarea>
        </div>
        <div class="header">
          <div class="tools">
<!--             <Icon
              class="cursor remove-highlight primary-hover"
              icon='file'
              title="Add file"
            />
            <span>
              &#128540;
            </span> -->
          </div>
          <div class="btn">
            <button
              class="button rb"
              @click="addComment"
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

import AuthButton from "@/components/Auth/Button.vue"
import Comment from "./Comment.vue"

import mom from 'moment'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    AuthButton,
    Comment,
  },
  props: ['payload'],
  data() {
    return {
      comment: '',
    }
  },
  mounted() {
    this.focus()

    const groupId = this.payload.groupId
    const room = this.payload.id
    
    const ids = this.nonReadCommentsById(groupId, room)
    if (ids.length > 0)
      this.$store.dispatch('group/readComments', {
        groupId, room, ids,
      })
  },
  methods: {
    enter(el, done) {

      const {height} = getComputedStyle(el)

      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = 1

        setTimeout(() => {
          s.height = 'auto'
          done()
        }, 210)
      })
      
    },
    leave(el, done) {

      const s = el.style

      s.transitionDuration = 0

      s.height = getComputedStyle(el).height
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = 0
        s.opacity = 0
        setTimeout(done, 205)
      })
      
    },
    deleteComment(id) {
      this.$store.dispatch('group/deleteComment', {
        group: this.payload.groupId,
        id: this.payload.id,
        commentId: id,
      })
    },
    focus() {
      const inp = this.$refs.input
      if (inp)
        inp.focus()
    },
    keydown(evt) {
      const {key} = evt

      if (key === "Enter" && this.isOnShift) {
        evt.preventDefault()
        this.addComment()
      }
    },
    addComment() {
      this.$store.dispatch('group/addComment', {
        group: this.payload.groupId,
        id: this.payload.id,
        name: this.comment,
      })
      this.comment = ''
    },
  },
  computed: {
    ...mapState({
      isOnShift: state => state.isOnShift,
    }),
    ...mapGetters({
      layout: 'layout',
      getGroupsById: 'group/getGroupsById',
      nonReadCommentsById: 'group/nonReadCommentsById',

      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    group() {
      return this.getGroupsById([this.payload.groupId])[0]
    },
    groupComments() {
      const room = (this.group.comments && this.group.comments[this.payload.id]) || {}
      return this.checkMissingIdsAndSortArr([],
        Object.keys(room).map(k => room[k]).filter(r => r && r.userId)
      )
    },
    groupCommentsReversed() {
      return this.groupComments.slice().reverse()
    },
  },
  watch: {
    groupCommentsReversed() {
      const ref = this.$refs.wrapper.$el
      if (ref) {
        setTimeout(() => {
          const diff = ref.scrollHeight - ref.scrollTop
          if (diff < 1500)
            ref.scrollTop = ref.scrollHeight
        })
      }
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
  flex-basis: 800px;
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
  overflow: hidden;
}

.comments {
  display: flex;
  height: 100%;
  flex-direction: column-reverse;
  overflow: auto;
  padding: 6px 0;
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

.comm {
  position: relative;
  z-index: 4;
}

</style>
