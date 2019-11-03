
import { fire, auth } from '../store/index'
import fb from 'firebase/app'

export const uid = () => auth.currentUser.uid
export const fd = () => fb.firestore.FieldValue
export const userRef = () => fire.collection('users').doc(uid())
export const taskRef = id => userRef().collection('tasks').doc(id)
export const listRef = id => userRef().collection('lists').doc(id)
export const tagRef = id => userRef().collection('tags').doc(id)
