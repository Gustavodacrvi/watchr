
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class SortableMixin extends Vue {

  getIdsFromElements(querySelector: string, requiredClass?: string, el?: any): string[] {
    let root!: any
    if (!el)
      root = document.querySelector(querySelector)
    else root = el
    if (root) {
      const els = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const arr = []
      for (const e of els)
        // tslint:disable-next-line:max-line-length
        if (requiredClass && e.classList.contains(requiredClass) || e.classList.contains('task-adder') || e.classList.contains('heading-adder'))
          arr.push(e)
        else if (!requiredClass)
          arr.push(e)
      const ids: string[] = []
      for (const e of arr)
        ids.push(e.dataset.vid)
      return ids
    }
    return []
  }
  getIdsFromSelectedElements(rootSelector: string, allowCancel: boolean = true): string[] {
    const root = document.querySelector(rootSelector)
    if (root) {
      const arr: HTMLElement[] = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
      const ids: string[] = []
      for (const el of arr)
        if (allowCancel && !el.classList.contains('cancel-getidsfromelements') || !allowCancel)
          if ((el.dataset.vid && el.classList.contains('sortable-selected')))
            ids.push(el.dataset.vid)
      return ids
    }
    return []
  }
}
