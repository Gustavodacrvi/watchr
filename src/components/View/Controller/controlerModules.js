
import list from './list'
import smartList from './smartList'
import calendar from './calendar'
import tag from './tag'
import folder from './folder'
import group from './group'

const addPrefix = (object, prefix) => {
  const p = prefix

  const mod = {methods: {}, computed: {}}
  for (const k of Object.keys(object.computed))
    mod.computed[p + k] = object.computed[k]
  
  return mod
}

export default [
  addPrefix(list, 'list'),
  addPrefix(group, 'group'),
  addPrefix(smartList, 'smartList'),
  addPrefix(calendar, 'calendar'),
  addPrefix(tag, 'tag'),
  addPrefix(folder, 'folder'),
]
