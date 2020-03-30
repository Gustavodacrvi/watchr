

import InputDrop from "@/components/Auth/DropInput.vue"

import { mapGetters, mapState } from 'vuex'

import utils from "@/utils/"

export default ({
  value,
  textFields,
  checklist, leftSmartIconDrops,
  saveByShortcut = () => {},
  instance = {},
  props = [],
}) => ({
  props: ['item', 'firstFieldOptions', 'value', ...props],
  data() {
    return {
      currentPrefix: '',
      cursorPos: 0,
      isFirstEdit: true,
      
      ...(instance.data ? instance.data() : {}),
    }
  },
  created() {
    if (this.item)
      this.model = {...this.model, ...this.item}

    setTimeout(() => this.isFirstEdit = false, 200)

    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown)
  },
  render(create) {
    return create('div', {
      class: 'EditBuilder',
      on: {
        click: evt => evt.stopPropagation(),
        pointerdown: evt => evt.stopPropagation(),
      },
    }, [
      create('div', {class: 'text-fields'}, 
        textFields.map(el =>
          create(InputDrop, {
            class: 'field no-back',
            props: el.props,
            ref: el.ref,

            domProps: {
              value: this.model[el.vModel],
              options: el.options ? this[el.options] : [],
            },
            on: {
              input(event) {
                this.$emit('input', event.target.value)
              },
            },
          })
        )
      )
    ])
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    },
    incrementPos(inc) {
      const newIndex = this.cursorPos + inc
      if (this.keyboardActions[newIndex])
        this.cursorPos = newIndex
      else if (inc > 0)
        this.cursorPos = 0
      else this.cursorPos = this.lastKeyboardActionIndex
    },
    keydown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt

      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      if (checklist && this.isCursorInChecklist && !isTyping) {
        switch (key) {
          case "Delete": {
            this.removeSubtask(this.activeChecklistId)
            break
          }
          case '.': {
            this.$refs.checklist.toggleTask(this.activeChecklistId)
            p()
            break
          }
          case " ": {
            this.$refs.checklist.addEdit(this.cursorPos - 1)
            p()
            break
          }
          case "Enter": {
            if (!isTyping) {
              p()
              this.$refs.checklist.editChecklist(this.activeChecklistId)
            }
            break
          }
        }
      }

      if (key === "Escape" && !isTyping)
        this.cancel()
      if (key === "Enter" && this.isElementFunction && !isTyping)
        this.keyboardActions[this.cursorPos]()

      utils.saveByShortcut(this, true, key, p, saveByShortcut, ['CalendarPicker'])


      if (!this.iconDrop && this.firstFieldOptions.length === 0) {
        if (key === "ArrowUp") {
          p()
  
          if (this.isOnShift)
            this.cursorPos = 0
          else        
            this.incrementPos(-1)
        } else if (key === "ArrowDown") {
          p()
  
          if (this.isOnShift)
            this.cursorPos = this.lastKeyboardActionIndex
          else        
            this.incrementPos(1)
        }
      }
    },
    select(val) {
      const arr = this.value.split(' ')
      arr[arr.length - 1] = this.currentPrefix + val
      let str = ''
      for (const s of arr)
        str += s + ' '

      if (value)
        value(str.slice(0, -1), this)
    },
    match(n, prefix, arr, onFind) {
      for (const el of arr) {
        const elName = ` ${prefix}${el.name}`
        if (n.includes(elName)) {
          this.model.name = n.replace(elName, '')
          onFind(el)
          break
        }
      }

      const split = n.split(' ')
      const lastWord = split[split.length - 1]
      if (lastWord[0] === prefix) {
        this.currentPrefix = prefix
        const word = lastWord.substr(1)

        send(
          arr.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
        )
        changedOptions = true
      }
    },
    focusName() {
      this.$emit('focus-on-field')
    },

    ...(instance.methods || {}),
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      iconDrop: state => state.iconDrop,
      user: state => state.user,

      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,
    }),
    ...mapGetters({
      lists: 'list/sortedLists',
      folders: 'folder/sortedFolders',
      groups: 'group/sortedGroupsByName',
      tags: 'tag/sortedTagsByName',
    }),

    keyboardActions() {
      const c = ref => () => this.$refs[ref].click()

      const obj = {
        0: this.focusName,
      }

      let num = 1
      
      const fieldFunctions = textFields.map(el => () => this.$refs[el.ref].focusInput(0))

      fieldFunctions.forEach(func => {
        obj[num] = func
        num++
      })
      
      const hasChecklist = this.hasChecklist

      for (const t of this.getChecklist) {
        obj[num] = t.id
        num++ 
      }
      
      const getIconsObj = () => {
        return {}
        num += !hasChecklist ? 0 : this.model[checklist.vModel].length

        return leftSmartIconDrops.reduce((obj, {ref}) => {
          obj[num] = c(ref)
          num++
          return obj
        }, {})
      }
      
      return {
        ...obj,
        ...getIconsObj(),
      }
    },
    hasChecklist() {
      return checklist && this.model[checklist.vModel].length > 0
    },
    isElementFunction() {
      const el = this.keyboardActions[this.cursorPos]
      return el && {}.toString.call(el) === '[object Function]'
    },
    getChecklist() {
      if (!checklist)
        return []
      return this.$store.getters.checkMissingIdsAndSortArr(this.model[checklist.order], this.model[checklist.vModel])
    },
    isEditingNotes() {
      return this.model.notes.length > 0
    },
    activeChecklistId() {
      return this.keyboardActions[this.cursorPos]
    },
    lastKeyboardActionIndex() {
      return Object.keys(this.keyboardActions).length - 1
    },
    isCursorInChecklist() {
      if (!checklist)
        return false
      return this.model[checklist.vModel].some(el => el.id === this.activeChecklistId)
    },
    
    ...(instance.computed || {}),
  },
  watch: {
    value() {
      if (value) {
        value(this.value, this)
      }
    },
    cursorPos(newPos, oldPos) {
      if (this.cursorPos < (textFields.length + 1) && this.isElementFunction)
        this.keyboardActions[this.cursorPos]()
    },
    
    ...(instance.watch || {}),
  },
})
