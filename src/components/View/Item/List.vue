<template>
  <ItemTemplate
    v-bind="{...$attrs, ...$props}"
    class='List'
    editComponent='List'

    ref='template'
    
    :item='item'
    :completedItem='completedItem'
    :showInfo='hasAtLeastOne'
    :canceledItem='canceledItem'
    :options='options'
    editRawPlaceholder='List name...'

    @copy-item='copyItem'

    @assign-user='assignUser'

    @complete-item='completeItem'
    @uncomplete-item='unCompleteItem'

    @cancel-item='cancelItem'
    @save='save'
    @uncancel-item='unCancelItem'
  >

    <template v-slot:check-icon='props'>
      <CheckIcon
        v-bind="{...{...$attrs, ...$props}, ...item}"

        :isItemSelected='isItemSelected'
        :completed='props.completed'
        :isSelecting='props.isEditing ? false : isSelecting'
        :canceled='props.canceled'
        :color='props.color'
        :itemModel='props.itemModel'
        :forceDefault='props.forceDefault'
      />
    </template>

    <template v-slot:before-name>
      <Icon v-if="isNewItem"
        class="name-icon slot-el"
        key='new-item-icon'
      
        icon='circle-full-filled'
        color='var(--yellow)'
        width='9px'
      />
      <span v-if="logStr && !showCheckDate"
        key='check-date'
        class="slot-el check-date"
      >
        {{ logStr }}
      </span>
      <span v-else-if="calendarStr"
        key='info-box'
        class="slot-el info-box"
      >
        {{ calendarStr }}
      </span>
    </template>

    <template v-slot:after-name>
      <span v-if="listTasksLength"
        key='duration'
        class="slot-el info-box"
      >
        {{ listTasksLength }}
      </span>
      <Icon v-if="listColor"
        key='color'
        class='icon name-icon slot-el'
        icon='tint'
        :color='hasFiles'
        width='11px'
      />
      <Icon v-if="hasFiles"
        key='file'
        class='icon name-icon slot-el'
        icon='file'
        :color='hasFiles'
        width='11px'
      />
    </template>

    <template v-slot:flex-end>
      <span v-if="deadlineStr"
        key='deadline'
        class="slot-el info-naked"
        style='color: var(--red)'
      >
        <span class="info-icon">
          <Icon
            icon='deadline'
            width='11px'
          />
        </span>
        <span>
          {{ deadlineStr }}
        </span>
      </span>
    </template>

    <template v-slot:info>
      <Info v-show="hasAtLeastOne"
        :tagNames='tagNames'
        :hasTags='hasTags'
        :folderObj='folderObj'
        :groupObj='groupObj'
      />
    </template>
    
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/List.vue"
import Info from "./Components/Info/List.vue"

import utilsList from "@/utils/list"

import mom from 'moment'

import templateMixin from "@/mixins/itemTemplate"

const tod = mom()

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  mixins: [templateMixin],
  components: {
    Info, CheckIcon,
  },
  props: [
    'item', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'hideGroupName', 'hideFolderName',
    'isSelecting', 'allowDeadlineStr', 'allowLogStr', 'itemModelFallback',
    'isAdding', 'listRenderer',
  ],
  data() {
    return {
      options: [],
    }
  },
  mounted() {
    this.getListOptions()
  },
  methods: {
    ...mapActions(['getOptions']),
    
    copyItem() {
      this.$store.dispatch('list/duplicateList', {
        list: this.item, rootTasks: this.tasks.filter(el => !el.heading && el.list === this.item.id), headingTasks: this.tasks.filter(el => el.heading && el.list === this.item.id),
      })
    },
    assignUser() {
      this.$store.dispatch('list/saveList', {
        id: this.item.id,
        assigned: uid,
      })
    },
    completeItem() {
      this.$store.dispatch('list/completeLists', [this.item])
    },
    unCompleteItem() {
      this.$store.dispatch('list/uncompleteLists', [this.item])
    },
    cancelItem() {
      this.$store.dispatch('list/cancelLists', [this.item.id])
    },
    async save(obj) {
      await this.$store.dispatch('list/saveList', {
        id: this.item.id,
        ...obj,
      })

      if (obj.handleFiles)
        this.$refs.template.isEditing = false
    },
    unCancelItem() {
      this.$store.dispatch('list/uncancelLists', [this.item.id])
    },
    async getListOptions() {
      if (!this.item) return;
      this.options = await this.getOptions(utilsList.listOptions(this, this.item))
      if (this.item.group) {
        this.options.splice(1, 0, {
          name: 'Add comments',
          icon: 'comment',
          callback: this.commentsPopup,
        })
        if (this.isGroupOwner)
          this.options.splice(2, 0, this.assignUserProfiles)
      }
    },
    commentsPopup() {
      if (!this.item)
        return;
      this.$store.dispatch('pushPopup', {
        comp: "Comments",
        payload: {
          groupId: this.item.group,
          id: this.item.id,
        },
      })
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      isRecurringList: 'list/isRecurringList',
      getListTasks: 'list/getTasks',
      getListDeadlineStr: 'list/getListDeadlineStr',
      getListCalendarStr: 'list/getListCalendarStr',
      isListCompleted: 'list/isListCompleted',
      isListCanceled: 'list/isListCanceled',

      getTagsById: 'tag/getTagsById',

      getFoldersById: 'folder/getFoldersById',
      getGroupsById: 'group/getGroupsById',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',
    }),
    
    folderObj() {
      if (!this.item || !this.item.folder)
        return false
      const folder = this.getFoldersById([this.item.folder])[0]
      if (folder.name === this.viewName)
        return null
      return folder
    },
    groupObj() {
      if (!this.item || !this.item.group)
        return false
      const group = this.getGroupsById([this.item.group])[0]
      if (group.name === this.viewName)
        return null
      return group
    },
    isGroupOwner() {
      return (this.itemGroup && this.itemGroup.userId === this.userInfo.userId)
    },
    itemGroup() {
      if (!this.item)
        return null
      return this.getGroupsById([this.item.group])[0]
    },
    assignUserProfiles() {
      return this.getAssigneeIconDrop(this.item, uid => this.assignUser(uid))
    },
    listTasks() {
      if (!this.item) return null
      return this.getListTasks(this.item.id)
    },
    listTasksLength() {
      return this.listTasks.length
    },
    completedItem() {
      if (!this.item) return null
      return this.isListCompleted(this.item)
    },
    hasAtLeastOne() {
      return this.hasTags || this.groupObj || this.folderObj
    },
    hasTags() {
      return this.item && this.item.tags && this.item.tags.length > 0
    },
    tagNames() {
      return this.getTagsById((this.item && this.item.tags) || []).map(el => el.name)
    },
    canceledItem() {
      if (!this.item) return null
      return this.isListCanceled(this.item)
    },
    deadlineStr() {
      if (!this.item) return null
      const list = this.item
      if (!list.deadline || this.disableDeadlineStr) return null
      return this.getListDeadlineStr(list, tod.format('Y-M-D'))
    },
    isItemSelected() {
      if (!this.item)
        return;
      return !this.movingItem && this.selectedItems.includes(this.item.id)
    },
    logStr() {
      if (!this.item || !this.allowLogStr || !this.item.logDate) return null
      return utils.getHumanReadableDate(this.item.logDate)
    },
    showCheckDate() {
      if (!this.item)
        return null
      const n = this.viewName
      if ((!this.item.checkDate && !this.item.completeDate) || n === 'Completed' || n === 'Logbook' || n === 'Canceled')
        return null
      return utils.getHumanReadableDate(this.item.checkDate || this.item.completeDate)
    },
    hasFiles() {
      return this.item && this.item.files && this.item.files.length > 0
    },
    listColor() {
      return this.item && this.item.color
    },
    calendarStr() {
      if (!this.item && this.disableCalendarStr)
        return null
      const c = this.item.calendar
      if (!c || this.isRecurringList(this.item))
        return null
      const res = this.getListCalendarStr(this.item, this.userInfo)
      if (res === 'Someday') return null
      return res
    },
  },
  watch: {
    item() {
      this.getListOptions()
    },
  },
}

</script>

<style scoped src="@/assets/css/itemTemplate.css"></style>
