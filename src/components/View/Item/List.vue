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

        :completed='props.completed'
        :canceled='props.canceled'
        :color='props.color'
        :forceDefault='props.forceDefault'
      />
    </template>
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/Task.vue"
import ItemTemplate from "./Components/ItemTemplate.vue"

import mom from 'moment'

export default {
  components: {
    CheckIcon,
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
    completedItem() {

    },
    hasAtLeastOne() {

    },
    canceledItem() {

    },
    options() {

    },
  },
}

</script>
