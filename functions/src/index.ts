import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firebase_tools = require('firebase-tools')

const firebase = admin.initializeApp();

const db = firebase.firestore()

// const db = admin.firestore()
// const FieldValue = admin.firestore.FieldValue


// APP CACHING

/* const updateCache = async (snap: any,  context: functions.EventContext, collection: string) => {
  const { userId, docId } = context.params

  const res = await db.collection('users').doc(userId).collection(collection)
    .where('id', '==', docId)
    .where('cloud_function_edit', '==', true).get()

  const promises: Array<Promise<FirebaseFirestore.WriteResult>> = []

  res.docs.forEach(doc => {
    const data = doc.data()
    if (data.cloud_function_edit)
      promises.push(
        db.collection('users').doc(userId).collection('cache').doc('cache').set({
          userId,
          [collection]: {
            [docId]: {...data, id: docId},
          },
        }, {merge: true})
      )
  })
  

  return Promise.all(promises)
} */

const deleteCache = (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext, collection: string) => {
  const { userId, docId } = context.params
  
  return  firebase.storage().bucket().deleteFiles({
      prefix: `attachments/${userId}/${collection}/${docId}`
    })
}

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


export const deleteGroupCollection = functions.firestore
  .document('groups/{groupId}/groupCache/groupCache')
  .onDelete((snap, context) => {
    return firebase_tools.firestore
            .delete(`groups/${context.params.groupId}`, {
              project: process.env.GCLOUD_PROJECT,
              recursive: true,
              yes: true,
            })
  })

export const addUserToGroup = functions.firestore
  .document('groups/{groupId}/invites/{inviteId}')
  .onUpdate(async (snap, context) => {
    const {groupId, inviteId} = context.params

    const groupRef = db.collection(`groups`).doc(groupId)
    const inviteRef = groupRef.collection('invites').doc(inviteId)
    const res = await inviteRef.get()
    const data = res.data()

    if (data && !data.denied) {
      
      const obj = {
        users: {
          [data.to]: true,
        },
        profiles: {
          [data.to]: data.targetProfile,
        },
      }

      const b = db.batch()

      b.set(groupRef.collection('info').doc('info'), obj, {merge: true})
      b.set(groupRef.collection('groupCache').doc('groupCache'), obj, {merge: true})
      b.delete(inviteRef)
      
      return b.commit()
    }
    return;
  })

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

