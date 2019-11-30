
import list from './list'
import smartList from './smartList'
import tag from './tag'
import folder from './folder'

const addPrefix = (object, prefix) => {
  const p = prefix

  const mod = {methods: {}, computed: {}}
  for (const k of Object.keys(object.methods))
    mod.methods[p + k] = object.methods[k]
  for (const k of Object.keys(object.computed))
    mod.computed[p + k] = object.computed[k]
  
  return mod
}

export default [
  addPrefix(list, 'list'),
  addPrefix(smartList, 'smartList'),
  addPrefix(tag, 'tag'),
  addPrefix(folder, 'folder'),
]
