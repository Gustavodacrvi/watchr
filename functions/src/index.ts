import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const firebase = admin.initializeApp();
const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue


// APP CACHING

const updateCache = (snap: functions.Change<FirebaseFirestore.DocumentSnapshot>, collection: string, userId: string, docId: string) => {
  const data = snap.after.data()

  if (data !== undefined) {
    
    if (data.from !== 'watchr_web_app')
      return db.collection('users').doc(userId).collection('cache').doc('cache').set({
        [collection]: {
          [docId]: data,
        },
      }, {merge: true})

    return;
  } else return db.collection('users').doc(userId).collection('cache').doc('cache').set({
      [collection]: {
        [docId]: FieldValue.delete(),
      }
    }, {merge: true})
}

export const updateTaskCache = functions.firestore
  .document("users/{userId}/tasks/{taskId}")
  .onWrite(async (snap, context) => {
    const { userId, taskId } = context.params
    return updateCache(snap, 'tasks', userId, taskId)
  })

export const updateListCache = functions.firestore
  .document("users/{userId}/lists/{listId}")
  .onWrite(async (snap, context) => {
    const { userId, listId } = context.params
    return updateCache(snap, 'lists', userId, listId)
  })

export const updateFoldersCache = functions.firestore
  .document("users/{userId}/folders/{folderId}")
  .onWrite(async (snap, context) => {
    const { userId, folderId } = context.params
    return updateCache(snap, 'folders', userId, folderId)
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


// ATTACHMENTS

export const deleteTaskAttachments = functions.firestore
  .document("users/{userId}/tasks/{taskId}")
  .onDelete((snap, context) => {
    const { userId, taskId } = context.params;
    const bucket = firebase.storage().bucket();

    return bucket.deleteFiles({
      prefix: `attachments/${userId}/tasks/${taskId}`
    });
  });

export const deleteListAttachments = functions.firestore
.document("users/{userId}/lists/{listId}")
.onDelete((snap, context) => {
  const { userId, listId } = context.params;
  const bucket = firebase.storage().bucket();

  return bucket.deleteFiles({
    prefix: `attachments/${userId}/lists/${listId}`
  });
});

export const deleteFolderAttachments = functions.firestore
.document("users/{userId}/folders/{folderId}")
.onDelete((snap, context) => {
  const { userId, folderId } = context.params;
  const bucket = firebase.storage().bucket();

  return bucket.deleteFiles({
    prefix: `attachments/${userId}/folders/${folderId}`
  });
});
