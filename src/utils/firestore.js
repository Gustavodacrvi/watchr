
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = id => fire.collection('users').doc(id ? id : uid())
export const taskColl = () => userRef().collection('tasks')
export const listColl = () => userRef().collection('lists')
export const folderColl = () => userRef().collection('folders')
export const tagColl = () => userRef().collection('tags')
export const taskRef = id => id ? taskColl().doc(id) : taskColl().doc()
export const listRef = id => id ? listColl().doc(id) : listColl().doc()
export const tagRef = id => id ? tagColl().doc(id) : tagColl().doc()
export const addTask = (batch, task, ref) => {
  return new Promise((solve, reject) => {
    const save = () => {
      batch.set(ref, {
        ...task, handleFiles: null,
      }, {merge: true})
      solve()
    }
    if (task.handleFiles)
      task.handleFiles(ref.id).then(save).catch(reject)
    else save()
  })
}
