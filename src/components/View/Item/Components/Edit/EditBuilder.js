

import InputDrop from "@/components/Auth/DropInput.vue"
import SmartIconDrop from "@/components/Icons/SmartIconDrop.vue"
import ChecklistVue from '@/components/View/Tasks/Checklist/Checklist.vue'
import FileApp from '@/components/View/RenderComponents/File.vue'
import FileDragDrop from '@/components/View/RenderComponents/FileDragDrop.vue'
import UploadProgressLine from "@/components/View/RenderComponents/UploadProgressLine.vue"


import momUtils from '@/utils/moment'

import FileMixin from '@/mixins/file.js'
import EditBuilderMixin from '@/mixins/editBuilder.js'

import { mapGetters, mapState } from 'vuex'

import utils from "@/utils/"

export default ({
  value,
  textFields,
  checklist, allowFiles,
  instance = {},
  props = [],
}) => ({
  props: ['item', 'firstFieldOptions', 'itemModelFallback', 'editAction', 'value', ...props],
  mixins: [FileMixin, EditBuilderMixin],
  data() {
    return {
      currentPrefix: '',
      cursorPos: 0,
      isFirstEdit: true,
      isAddingChecklist: false,
      savingItem: false,
      
      ...(instance.data ? instance.data() : {}),
    }
  },
  created() {
    this.model = {...this.model, ...this.itemModelFallback}
    if (this.item) {
      this.model = {...this.model, ...this.item}
    }

    setTimeout(() => this.isFirstEdit = false, 200)

    window.addEventListener('keydown', this.keydown)
    this.$store.commit('isEditing', true)

    if (instance.created)
      instance.created.apply(this)
  },
  mounted() {
    this.handleEditAction()
  },
  beforeDestroy() {
    this.$store.commit('isEditing', false)
    window.removeEventListener('keydown', this.keydown)
  },
  render(create) {

    let num = this.getFirstSmartIconKeyboardActionPosition - 1

    const mapSmartIconDrops = arr => {
      return arr.map(el => {
      
        num++
        const currentNumber = num
        return create(SmartIconDrop, {
          class: 'smart',
          props: {
            ...el.props,
            active: currentNumber === this.cursorPos,
          },
          ref: el.id,
          key: el.id,
  
          on: {
            trigger: getModel => {
              if (el.onTrigger)
                el.onTrigger(this, getModel)
            },
          },
          nativeOn: {
            click: () => {
              if (!el.props.disabled)
                this.cursorPos = currentNumber
            },
          },
        })
      })
    }
    
    const leftComponents = mapSmartIconDrops(this.leftSmartIconDrops)
    const rightComponents = mapSmartIconDrops(this.rightSmartIconDrops)

    num = 0

    const editChildren = [
      create('div', {class: 'text-fields'},
        textFields.map(el => {

          num++
          const currentNumber = num
          return create(InputDrop, {
            class: 'field no-back',
            ref: el.id,
            key: el.id,

            props: {
              ...el.props,
              value: this.model[el.vModel],
              options: el.options ? this[el.options] : [],
            },
            on: {
              input: value => {
                this.model[el.vModel] = value
              },
              goup: () => {
                this.$parent.$parent.$parent.$parent.$emit('goup')
                setTimeout(() => {
                  this.$refs[el.id].focusInput()
                })
              },
              godown: () => {
                this.$parent.$parent.$parent.$parent.$emit('godown')
                setTimeout(() => {
                  this.$refs[el.id].focusInput()
                })
              },
              cancel: () => this.$parent.$emit('close'),
            },
            nativeOn: {
              click: () => {
                if (!el.props.disabled)
                  this.cursorPos = currentNumber
              },
            },
          })
        })
      ),
      create('div', {class: 'smart-icons'}, [
          create('div', {class: 'left-icons'}, leftComponents),
          create('div', {class: 'right-icons'}, rightComponents),
        ]
      ),
    ]

    if (checklist)
      editChildren.splice(1, 0, create(ChecklistVue, {
        ref: 'subitems',

        class: {
          hasContent: this.getChecklist && this.getChecklist.length > 0
        },
        props: {
          list: this.getChecklist,
          activeChecklistId: this.activeChecklistId,
          compareDate: this.getCompareDate,
        },

        on: {
          moveCursor: this.moveCursor,
          resetCursor: this.resetCursor,
          isAddingToggle: v => this.isAddingChecklist = v,
          add: this.addSubtask,
          remove: this.removeSubtask,
          update: this.updateIds,
          saveChecklist: this.saveChecklist,
        },
      })
    )

    if (allowFiles) {
      editChildren.splice(2 - (checklist ? 0 : 1), 0, 
        create('div', {class: 'file-drag-drop-wrapper'}, [
          create(FileDragDrop, {
            props: {
              onDrop: this.onDrop,
            }
          })
        ])
      )
      editChildren.splice(3 - (checklist ? 0 : 1), 0, 
        create('div', {class: {
          files: true,
          hasContent: this.getFiles && this.getFiles.length > 0
        }}, this.getFiles.map(str => {
          return create(FileApp, {
            key: str,
            props: {
              name: str,
              status: this.getFileStatus(str),
              active: this.activeFileName,
            },
            on: {
              delete: () => this.deleteFile(str),
              download: () => this.downloadFile(str, this.model.id),
              view: () => this.viewFile(str, this.model.id)
            },
          })
        }))
      )
    }

    num = textFields.length + this.getChecklist.length

    editChildren.splice(2 - (checklist ? 0 : 1), 0,
      create('div', {class: {
        tags: true,
        hasContent: this.getViewTags && this.getViewTags.length > 0 
      }},
        this.getViewTags.map(tag => {

          num++
          const currentNumber = num
          return create(SmartIconDrop, {
            key: tag.id,
            ref: tag.id,

            props: {
              ...tag.props,
              tagMode: true,
              active: currentNumber === this.cursorPos,
            },
            nativeOn: {
              click: () => this.cursorPos = currentNumber
            }
          })
        })
      )
    )

    if (allowFiles && this.getFiles && this.getFiles.length && this.model.group)
        editChildren.splice(3 - (checklist ? 0 : 1), 0,
          create('div', {class: 'hasContent'}, [
            'Note: Save your files before sending a task/list to a shared group, group files are not supported and they will be lost forever.'
          ])
        )

    if (allowFiles && this.savingItem)
        editChildren.push(
          create(UploadProgressLine, {
            props: this.uploadProgress,
          })
        )

    return create('div', {
      class: 'EditBuilder',
      on: {
        click: evt => evt.stopPropagation(),
        pointerdown: evt => evt.stopPropagation(),
      },
    }, editChildren)
  },
  methods: {
    handleEditAction() {
      if (this.editAction)
        this.editAction(this)
    },
    save() {
      const model = this.beforeSave(this.model, this)

      if (model) {
        if (allowFiles && model.group)
          model.files = []
          
        if (allowFiles && this.isEditingFiles && this.addedFiles.length > 0)
          this.savingItem = true

        const obj = model

        if (allowFiles) {
          obj.files = this.files || []
          obj.handleFiles = this.isEditingFiles ? itemId => {
            return new Promise((solve, reject) => {
              this.saveFiles(this.getFilesToRemove, this.addedFiles, itemId)
              .then(() => {
                this.files = []
                this.addedFiles = []
                this.savingItem = false
                solve()
              })
              .catch(() => {
                this.$store.commit('pushToast', {
                  name: 'An error occurred while editing files.',
                  seconds: 4,
                  type: 'error',
                })
                reject()
                this.savingItem = false
              })
            })
          } : null
        }
        this.$emit('save', {...obj})

        this.afterSave(this.model)
      }
    },
    
    updateIds(ids) {
      this.model[checklist.order] = ids
      this.saveChecklist()
    },
    resetCursor() {
      if (!this.isAddingChecklist)
        this.cursorPos = 0
    },
    moveCursor(dire) {
      const newIndex = this.cursorPos + dire
      if (this.keyboardActions[newIndex])
        this.cursorPos = newIndex
    },
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
    closeAllDropdowns() {
      this.getViewTags.forEach(({id}) => this.$refs[id].tagModeToggle = false)
    },
    focusSmartInputById(id) {
      const icons = this.allSmartIcons
      let num = this.getFirstSmartIconKeyboardActionPosition
      for (const icon of icons) {
        if (icon.id === id) {
          this.closeAllDropdowns()
          return this.$nextTick(() => {
            this.cursorPos = num
            return true
          })
        }
        num++
      }
      num = this.getFirstViewTagKeyboardActionPosition
      const tags = this.getViewTags
      for (const icon of tags) {
        if (icon.id === id) {
          this.closeAllDropdowns()
          return this.$nextTick(() => {
            this.cursorPos = num
            this.keyboardActions[num]()
          })
          return true
        }
        num++
      }
    },
    keydown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt

      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      if (this.isOnShift && key === 'Enter')
        return this.save()

      if (this.isOnAlt && !this.isOnControl) {
        const vals = {
          s: 'calendar',
          m: 'move',
          d: 'deadline',
          t: 'tag',
          p: 'priority',
          e: 'duration',
          a: 'assign',
          o: 'color',
          n: 'evening',
          c: 'checklist',
          h: 'hour',
        }

        this.focusSmartInputById(vals[key])
      }

      if (checklist && this.isCursorInChecklist && !isTyping) {
        switch (key) {
          case "Delete": {
            this.removeSubtask(this.activeChecklistId)
            break
          }
          case '.': {
            this.$refs.subitems.toggleTask(this.activeChecklistId)
            p()
            break
          }
          case " ": {
            this.$refs.subitems.addEdit(this.cursorPos - 1)
            p()
            break
          }
          case "Enter": {
            if (!isTyping) {
              p()
              this.$refs.subitems.editChecklist(this.activeChecklistId)
            }
            break
          }
        }
      }
      if (allowFiles && this.isCursorInFile && !isTyping) {
        switch (key) {
          case "Delete": {
            this.deleteFile(this.activeFileName)
            break
          }
          case 'Enter': {
            this.downloadFile(this.activeFileName, this.model.id)
            break
          }
          case " ": {
            this.viewFile(this.activeFileName, this.model.id)
            break
          }
        }
      }

      if (key === "Escape" && !isTyping)
        this.cancel()
      if (key === "Enter" && this.isElementFunction && !isTyping) {
        this.keyboardActions[this.cursorPos]()
      }

      utils.saveByShortcut(this, true, key, p, this.saveByShortcut || (() => {}), ['CalendarPicker'])

      if (!this.iconDrop && this.firstFieldOptions.length === 0) {
        if ((key === "ArrowUp" && !this.currentSmartIconHasList) || (key === "ArrowLeft" && this.cursorPos > textFields.length)) {
          p()
  
          if (this.isOnShift)
            this.cursorPos = 0
          else        
            this.incrementPos(-1)
        } else if ((key === "ArrowDown" && !this.currentSmartIconHasList) || (key === 'Tab') || (key === "ArrowRight" && this.cursorPos > textFields.length)) {
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

        this.$emit('set-first-field-options',
          arr.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
        )
        return true
      }
      return false
    },
    focusName() {
      this.$emit('focus-on-field')
    },
    removeNameFocus() {
      this.$emit('remove-focus')
    },

    ...(instance.methods || {}),
  },
  computed: {
    currentSmartIconHasList() {
      if (this.cursorPos < this.getFirstSmartIconKeyboardActionPosition)
        return false
      const icon = this.allSmartIcons[this.cursorPos - this.getFirstSmartIconKeyboardActionPosition]
      return icon.props.list && icon.props.list.length > 0  
    },
    allSmartIcons() {
      return [
        ...this.leftSmartIconDrops,
        ...this.rightSmartIconDrops,
      ]
    },
    leftSmartIconDrops() {
      return []
    },
    rightSmartIconDrops() {
      return []
    },
    getViewTags() {
      return []
    },

    getFirstViewTagKeyboardActionPosition() {
      return this.fieldFunctions.length + 1 + (this.hasChecklist ? this.model[checklist.vModel].length : 0)
    },
    getFirstSmartIconKeyboardActionPosition() {
      return this.fieldFunctions.length + 1 + (this.hasChecklist ? this.model[checklist.vModel].length : 0) + this.getViewTags.length + this.getFiles.length
    },
    getCompareDate() {
      if (!this.item) return null
      const c = this.item.calendar
      if (!c || !this.isRecurringItem(this.item))
        return null
      return momUtils.getNextEventAfterCompletionDate(c).format('Y-M-D')
    },
    fieldFunctions() {
      return textFields.map(el => () => this.$refs[el.id].focusInput(0))
    },
    removeFocusRefs() {
      const obj = {
        0: this.removeNameFocus
      }

      let num = 1

      textFields.forEach(({id}) => {
        obj[num] = () => this.$refs[id].removeFocus()

        num++
      })
      
      return obj
    },
    keyboardActions() {
      const obj = {
        0: this.focusName,
      }

      let num = 1
      
      this.fieldFunctions.forEach(func => {
        obj[num] = func
        num++
      })
      
      for (const t of this.getChecklist) {
        obj[num] = t.id
        num++ 
      }
      
      this.getViewTags.forEach(({id}) => {
        obj[num] = () => this.$refs[id].activate(null, true)
        num++
      })

      this.getFiles.forEach(str => {
        obj[num] = str
        num++
      })

      this.allSmartIcons.forEach(({id}) => {
        obj[num] = () => this.$refs[id].activate(null, true)
        num++
      })
      
      return obj
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
    activeFileName() {
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
    isCursorInFile() {
      if (!allowFiles)
        return false
      return this.getFiles.some(str => str === this.activeFileName)
    },
    getViewTags() {
      return []
    },
    
    ...(instance.computed || {}),
  },
  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('model', this.model)
      },
    },
    editAction() {
      this.handleEditAction()
    },
    value() {
      if (value) {
        value(this.value, this)
      }
    },
    cursorPos(newPos, oldPos) {
      const textFieldLastIndex = textFields.length

      if (oldPos <= textFieldLastIndex && textFieldLastIndex < newPos) {
        this.removeFocusRefs[oldPos]()
      }
      
      if (this.cursorPos < (textFields.length + 1) && this.isElementFunction)
        this.keyboardActions[this.cursorPos]()
    },
    
    ...(instance.watch || {}),
  },
})
