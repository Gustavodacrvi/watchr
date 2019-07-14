
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SortableMixin extends Vue {

  getIdsFromElements(querySelector: string): string[] {
    const root = document.querySelector(querySelector)
    if (root) {
      const arr = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        ids.push(el.dataset.vid)
      return ids
    }
    return []
  }
  getIdsFromSelectedElements(rootSelector: string): string[] {
    const root = document.querySelector(rootSelector)
    if (root) {
      const arr: HTMLElement[] = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        if (el.dataset.vid && el.classList.contains('sortable-selected'))
          ids.push(el.dataset.vid)
      return ids
    }
    return []
  }
}
