import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firebase = admin.initializeApp();
const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue


// APP CACHING

const updateCache = async (snap: any,  context: functions.EventContext, collection: string) => {
  const { userId, docId } = context.params

  const res = await db.collection('users').doc(userId).collection(collection)
    .where('id', '==', docId)
    .where('cloud_function_edit', '==', true).get()

  const promises: Array<Promise<FirebaseFirestore.WriteResult>> = []

  res.docs.forEach(doc => {
    promises.push(
      db.collection('users').doc(userId).collection('cache').doc('cache').set({
        userId,
        [collection]: {
          [docId]: {...doc.data(), id: docId},
        },
      }, {merge: true})
    )
  })
  

  return Promise.all(promises)
}

const deleteCache = (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext, collection: string) => {
  const { userId, docId } = context.params
  
  return Promise.all([
    db.collection('users').doc(userId).collection('cache').doc('cache').set({
      userId,
      [collection]: {
        [docId]: FieldValue.delete(),
      }
    }, {merge: true}),
    firebase.storage().bucket().deleteFiles({
      prefix: `attachments/${userId}/${collection}/${docId}`
    }),
  ])
}

export const createTaskCache = functions.firestore
  .document("users/{userId}/tasks/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'tasks'))
  
export const createListCache = functions.firestore
  .document("users/{userId}/lists/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'lists'))

export const createInfoCache = functions.firestore
  .document("users/{userId}/info/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'info'))

export const createFoldersCache = functions.firestore
  .document("users/{userId}/folders/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'folders'))

export const createStatsCache = functions.firestore
  .document("users/{userId}/stats/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'stats'))

export const createTagsCache = functions.firestore
  .document("users/{userId}/tags/{docId}")
  .onCreate((a, b) => updateCache(a, b, 'tags'))

export const updateTaskCache = functions.firestore
  .document("users/{userId}/tasks/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'tasks'))
  
export const updateListCache = functions.firestore
  .document("users/{userId}/lists/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'lists'))

export const updateInfoCache = functions.firestore
  .document("users/{userId}/info/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'info'))

export const updateFoldersCache = functions.firestore
  .document("users/{userId}/folders/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'folders'))

export const updateStatsCache = functions.firestore
  .document("users/{userId}/stats/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'stats'))

export const updateTagsCache = functions.firestore
  .document("users/{userId}/tags/{docId}")
  .onUpdate((a, b) => updateCache(a, b, 'tags'))

export const deleteTaskCache = functions.firestore
  .document("users/{userId}/tasks/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'tasks'))
  
export const deleteListCache = functions.firestore
  .document("users/{userId}/lists/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'lists'))

export const deleteInfoCache = functions.firestore
  .document("users/{userId}/info/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'info'))

export const deleteFoldersCache = functions.firestore
  .document("users/{userId}/folders/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'folders'))

export const deleteStatsCache = functions.firestore
  .document("users/{userId}/stats/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'stats'))

export const deleteTagsCache = functions.firestore
  .document("users/{userId}/tags/{docId}")
  .onDelete((a, b) => deleteCache(a, b, 'tags'))


/*
      const { userId } = context.params

    
    const res = await db.collection('users').doc(userId).collection('tasks').where('userId', '==', userId).get()
    
    const promises: Array<Promise<FirebaseFirestore.WriteResult>> = []

    res.docs.forEach(doc => {
      promises.push(
        db.collection('users').doc(userId).collection('cache').doc('cache').set({
          tasks: {
            [doc.id]: doc.data(),
          },
        }, {merge: true})
      )
    })

    return Promise.all(promises)
*/

