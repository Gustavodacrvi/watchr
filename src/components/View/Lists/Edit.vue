<template>
  <div class="ListEdit">
    <EditVue
      :name='list.name'
      placeholder='List name...'
      :keepOpen='true'
      @save='save'
      @cancel='$emit("cancel")'
    />
  </div>
</template>

<script>

import EditVue from './../RenderComponents/Edit.vue'

export default {
  components: {
    EditVue,
  },
  data() {
    return {
      list: {
        name: '',
      },
    }
  },
  methods: {
    save(name) {
      if (name) {
        this.$emit('save', {
          name,
        })
      }
    },
  },
}

</script>
