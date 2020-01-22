import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firebase = admin.initializeApp();
const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue


// APP CACHING

const updateCache = (snap: functions.Change<FirebaseFirestore.DocumentSnapshot>,  context: functions.EventContext, collection: string, removeAttachmentsOnDelete: boolean) => {
  const { userId, docId } = context.params
  
  const data = snap.after.data()

  if (data !== undefined) {
    
    if (data.from !== 'watchr_web_app')
      return db.collection('users').doc(userId).collection('cache').doc('cache').set({
        [collection]: {
          [docId]: data,
        },
      }, {merge: true})

    return;
  } else {
    const promises: any[] = []
    
    promises.push(
      db.collection('users').doc(userId).collection('cache').doc('cache').set({
        [collection]: {
          [docId]: FieldValue.delete(),
        }
      }, {merge: true})
    )
    if (removeAttachmentsOnDelete)
      promises.push(
        firebase.storage().bucket().deleteFiles({
          prefix: `attachments/${userId}/${collection}/${docId}`
        })
      )
    
    return Promise.all(promises)
  }
}

export const updateTaskCache = functions.firestore
  .document("users/{userId}/tasks/{docId}")
  .onWrite((a, b) => updateCache(a, b, 'tasks', true))
  
export const updateListCache = functions.firestore
  .document("users/{userId}/lists/{docId}")
  .onWrite((a, b) => updateCache(a, b, 'lists', true))

export const updateFoldersCache = functions.firestore
  .document("users/{userId}/folders/{docId}")
  .onWrite((a, b) => updateCache(a, b, 'folders', true))

export const updateStatsCache = functions.firestore
  .document("users/{userId}/stats/{docId}")
  .onWrite((a, b) => updateCache(a, b, 'stats', false))

export const updateTagsCache = functions.firestore
  .document("users/{userId}/tags/{docId}")
  .onWrite((a, b) => updateCache(a, b, 'tags', false))


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

