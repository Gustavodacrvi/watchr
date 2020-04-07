<template>
  <ItemTemplate
    v-bind="{...$attrs, ...$props}"
    class='List'
    editComponent='Task'
    
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
        :canceled='props.canceled'
        :color='props.color'
        :forceDefault='props.forceDefault'
      />
    </template>

    <template v-slot:before-name>
      <span v-if="logStr && !showCheckDate"
        key='check-date'
        class="check-date"
      >
        {{ logStr }}
      </span>
      <span v-else-if="calendarStr"
        key='info-box'
        class="info-box"
      >
        {{ calendarStr }}
      </span>
    </template>

    <template v-slot:after-name>
      <span v-if="listTasksLength"
        key='duration'
        class="info-box"
      >
        {{ listTasksLength }}
      </span>
    </template>

    <template v-slot:flex-end>
      <span v-if="deadlineStr"
        key='deadline'
        class="info-naked"
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
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/List.vue"
import ItemTemplate from "./Components/ItemTemplate.vue"

import mom from 'moment'

const tod = mom()

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    CheckIcon, ItemTemplate,
  },
  props: [
    'item', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'hideGroupName', 'hideFolderName',
    'isSelecting', 'allowDeadlineStr', 'allowLogStr', 'itemModelFallback',
    'isAdding', 'listRenderer', 'viewName', 'viewType',
  ],
  methods: {
    copyItem() {

    },
    assignUser() {

    },
    completeItem() {

    },
    unCompleteItem() {

    },
    cancelItem() {

    },
    save() {

    },
    unCancelItem() {

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
    }),
    
    listTasks() {
      return this.getListTasks(this.item.id)
    },
    listTasksLength() {
      return this.listTasks.length
    },
    completedItem() {

    },
    hasAtLeastOne() {

    },
    canceledItem() {

    },
    options() {

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
}

</script>

<style scoped src="@/assets/css/itemTemplate.css"></style>
