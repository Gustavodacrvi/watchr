
import list from './list'
import smartList from './smartList'
import tag from './tag'

const addPrefix = (object, prefix) => {
  const p = prefix

  const mod = {methods: {}, computed: {}}
  for (const k of Object.keys(object.methods))
    mod.methods[p + k] = mod.methods[k]
  for (const k of Object.keys(object.computed))
    mod.computed[p + k] = mod.computed[k]
  
  return mod
}

export default [
  addPrefix(list, 'list'),
  addPrefix(smartList, 'smartList'),
  addPrefix(tag, 'tag'),
]
