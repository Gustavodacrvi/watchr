<template>
  <ItemTemplate
    v-bind="{...$attrs, ...$props}"
    editComponent='Folder'
    editRawPlaceholder='Folder name...'

    ref='template'

    :item='item'
  >
  
    <template v-slot:check-icon>
      <CheckIcon
        v-bind="{...{...$attrs, ...$props}}"
      />
    </template>
  
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/Folder.vue"

import templateMixin from "@/mixins/itemTemplate"

export default {
  mixins: [templateMixin],
  components: {
    CheckIcon,
  },
  props: [
    'item', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'hideGroupName', 'hideFolderName',
    'isSelecting', 'allowDeadlineStr', 'allowLogStr', 'itemModelFallback',
    'isAdding', 'listRenderer',
  ],
}

</script>
