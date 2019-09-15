import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp()

const fcm = admin.messaging()

interface Notification {
  title: string
  body: string
  token: string
}

export const sentMsg = functions.firestore.document('notifications/{msgId}')    .onCreate(async snapshot => {
  const {title, body, token} = snapshot.data() as Notification
  
  const payload = {
    notification: {
      title, body,
      icon: '../../public/img/icons/favicon-32x32.png',
    },
  }

  return fcm.sendToDevice(token, payload)
})

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
