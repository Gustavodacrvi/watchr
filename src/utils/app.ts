

export default {
  updateArrayOrderFromFilteredArray(oldArray: any[], filteredArray: any[]): any[] {
    const ids: Set<string> = new Set()

    for (const el of filteredArray)
      ids.add(el.id)

    const arr: any[] = []
    let i = 0
    for (const el of oldArray) {
      if (ids.has(el.id)) {
        arr.push(filteredArray[i])
        i++
        continue
      }
      arr.push(el)
    }
    return arr
  },
  snakeToCamel(s: string) {
    return s.replace(/(\-\w)/g, (m: any) => m[1].toUpperCase())
  },
  getNodeById(tree: any[], subNodesPropertyName: string, id: string): any {
    const walk = (subNodes: any[]): any | undefined => {
      for (const node of subNodes) {
        if (node.id === id)
          return node
        const childNode: any | undefined = walk(node[subNodesPropertyName])
        if (childNode !== undefined)
          return childNode
      }
      return undefined
    }
    return walk(tree)
  },
  deleteNodeById(tree: any[], subNodesPropertyName: string, id: string) {
    const walk = (nodes: any[]): boolean => {
      let i = 0
      for (const node of nodes) {
        if (node.id === id) {
          nodes.splice(i, 1)
          return true
        }
        const childNode: boolean = walk(node[subNodesPropertyName])
        if (childNode)
          return true
        i++
      }
      return false
    }
    walk(tree)
  },
}
