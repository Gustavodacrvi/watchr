<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      :list="getList"
      :illustration="illustration"
      :active="active"
      :viewType="viewType"
      @update='update'
    />
    <div style="height: 50px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
  },
  computed: {
    ...mapGetters(['l']),
    sortedLists() {
      return this.$store.getters['list/sortedLists']
    },
    getList() {
      const lists = this.sortedLists
      for (const list of lists) {
        list.callback = () => {
          this.$router.push('/user?list=' + list.name)
        }
        list.options = [
          {
            name: 'Edit list',
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {comp: 'AddList', payload: list})
            }
          },
          {
            name: 'Delete list',
            icon: 'trash',
            callback: () => this.$store.dispatch('list/deleteList', list.id)
          }
        ]
      }
      return lists
    },
    illustration() {
      return {
        name: 'List',
        title: this.l["You don't have any lists."],
        descr: this.l["You can add one by dropping the plus floating button in this region."],
        width: '80px'
      }
    },
  },
}

</script>
