<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--purple)'
      :disableSelection='true'
      :enableSort="false"
      :illustration="illustration"
      :list="getList"
      :active="active"
      :viewType="viewType"
      :mapNumbers="(tasks) => tasks"
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <div style="height: 100px"></div>
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
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj}})
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
              this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...list, editing: true}})
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
      let descr = this.l["You can add one by dropping the plus floating button in this region."]
      if (!this.isDesktop)
        descr = this.l["You can add one by clicking on the right corner icon."]
      return {
        descr,
        name: 'List',
        title: this.l["You don't have any lists."],
        width: '80px'
      }
    },
  },
}

</script>
