import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const firebase = admin.initializeApp();

export const deleteAttachments = functions.firestore
  .document("users/{userId}/tasks/{taskId}")
  .onDelete((snap, context) => {
    const { userId, taskId } = context.params;
    const bucket = firebase.storage().bucket();

    return bucket.deleteFiles({
      prefix: `attachments/${userId}/tasks/${taskId}`
    });
  });
