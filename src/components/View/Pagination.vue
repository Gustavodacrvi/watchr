<template>
  <div class="Pagination">
    <div class="pages rb cbd shadow">
      <div v-for="p in getPagesArray" :key="p"
        class="page cursor remove-highlight"
        :class="{active: isActive(p)}"
        @click="move(p)"
      >{{p + 1}}</div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['page', 'numberOfPages'],
  methods: {
    move(page) {
      this.$emit('select', page)
    },
    isActive(page) {
      return page === this.page
    },
  },
  computed: {
    getPagesArray() {
      const arr = []
      for (let i = 0;i < this.numberOfPages;i++) {
        arr.push(i)
      }
      return arr
    },
  },
}

</script>

<style scoped>

.Pagination {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pages {
  display: flex;
  overflow: hidden;
}

.page {
  padding: 14px;
  transition-duration: .15s;
}

.page:hover {
  background-color: var(--light-gray);
}

.page + .page {
  border-left: 1px solid var(--light-gray);
}

.active {
  background-color: var(--primary);
  color: var(--dark);
}

</style>
