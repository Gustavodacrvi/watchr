<template>
  <div class="ItemList">
    <ItemRenderer
      :name='name'
    />
  </div>
</template>

<script>

import ItemRenderer from "./ItemRenderer.vue"

export default {
  components: {
    ItemRenderer,
  },
  props: ['name'],
  methods: {

  },
  computed: {

  },
}

</script>
