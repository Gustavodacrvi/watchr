

import { State, Getters, ProjectActions } from '@/interfaces/store/project'
import appUtils from '@/utils/app'
import { Folder, Project } from '@/interfaces/app'

import timezone from 'moment-timezone'

interface Actions {
  getData: ProjectActions.StoreGetData
  addFoldersOrder: ProjectActions.StoreAddFoldersOrder
  addFolder: ProjectActions.StoreAddFolder
  deleteFolderAndProjectsByFolderId: ProjectActions.StoreDeleteFolderAndProjectsByFolderId
  editFolderNameById: ProjectActions.StoreEditFolderNameById
  saveFoldersOrder: ProjectActions.StoreSaveFoldersOrder
  addProject: ProjectActions.StoreAddProject
  moveProjectsFromFolder: ProjectActions.StoreMoveProjectsFromFolder
  toggleProjectPin: ProjectActions.StoreToggleProjectPin
  editProject: ProjectActions.StoreEditProject
  deleteProjectById: ProjectActions.StoreDeleteProjectById
  completeProjectTask: ProjectActions.StoreCompleteProjectTask
}

export default {
  namespaced: true,
  state: {
    projects: [],
    folders: [],
    foldersOrder: [],
  } as State,
  mutations: {

  },
  getters: {
    sortedFolders(state) {
      const order: string[] = appUtils.fixOrder(state.folders, state.foldersOrder)
      return appUtils.sortArrayByIds(state.folders, order)
    },
    sortedFoldersByName(state) {
      const fol = state.folders.slice()
      fol.sort((a, b) => a.name.localeCompare(b.name))
      return fol
    },
    sortedProjectsByName(state) {
      const p = state.projects.slice()
      p.sort((a, b) => a.name.localeCompare(b.name))
      return p
    },
    getPinedProjectsByFolderId: (state) => (id) => {
      const fold = state.folders.find(el => el.id === id) as Folder
      const arr = []
      for (const proId of fold.projects) {
        const project = state.projects.find(el => el.id === proId)
        if (project && project.bindOnOverview) arr.push(project)
      }
      return arr
    },
    getProjectByName: (state) => (name) => {
      return state.projects.find(el => el.name === name)
    },
    getProjectsByFolderId: (state) => (id) => {
      const fold = state.folders.find(el => el.id === id) as Folder
      const arr = []
      for (const proId of fold.projects) {
        const project = state.projects.find(el => el.id === proId)
        if (project) arr.push(project)
      }
      return arr
    },
  } as Getters,
  actions: {
    addFoldersOrder({ rootState }, id) {
      if (rootState.firestore && rootState.uid) {
        rootState.firestore.collection('foldersOrder').doc(id).set({
          order: [],
          userId: id,
        })
      }
    },
    editProject({ rootState }, {name, description, id}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('projects').doc(id).update({
          name, description,
        })
    },
    editFolderNameById({ rootState }, {name, id}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('folders').doc(id).update({
          name,
        })
    },
    deleteProjectById({ rootState }, id) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('projects').doc(id).delete()
    },
    toggleProjectPin({ rootState, state }, id) {
      if (rootState.firestore && rootState.uid) {
        const pro = state.projects.find(el => el.id === id) as Project
        rootState.firestore.collection('projects').doc(id).update({
          bindOnOverview: !pro.bindOnOverview,
        })
      }
    },
    moveProjectsFromFolder({ rootState }, {from, to, ids}) {
      if (rootState.firestore && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.firestore.batch()

        const fromRef = rootState.firestore.collection('folders').doc(from)
        const toRef = rootState.firestore.collection('folders').doc(to)

        batch.update(fromRef, {
          projects: fire.arrayRemove(...ids),
        })
        batch.update(toRef, {
          projects: ids,
        })

        batch.commit()
      }
    },
    completeProjectTask({ rootState }, {task, projectId}) {
      if (rootState.firestore && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.firestore.batch()

        const taskRef = rootState.firestore.collection('tasks').doc(task.id)
        batch.delete(taskRef)

        const proRef = rootState.firestore.collection('projects').doc(projectId)
        batch.update(proRef, {
          completedTasks: fire.arrayUnion(task),
          tasks: fire.arrayRemove(task.id),
        })

        batch.commit()
      }
    },
    addProject({ rootState }, {name, foldId, description}) {
      const u = timezone().utc()
      const dt = u.format('Y-M-D HH:mm')
      if (rootState.firestore && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.firestore.batch()

        const proRef = rootState.firestore.collection('projects').doc()
        const foldRef = rootState.firestore.collection('folders').doc(foldId)

        batch.set(proRef, {
          name, description,
          userId: rootState.uid,
          creationDate: dt,
          lastEditDate: dt,
          bindOnOverview: false,
          folderId: foldRef.id,
          headingsOrder: [],
          completedTasks: [],
          tasks: [],
          headings: [],
        })

        batch.update(foldRef, {
          projects: fire.arrayUnion(proRef.id),
        })

        batch.commit()
      }
    },
    deleteFolderAndProjectsByFolderId({ rootState, state }, id) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()
        const fold = state.folders.find(el => el.id === id) as Folder

        const ref = rootState.firestore.collection('folders').doc(fold.id)
        batch.delete(ref)

        for (const i of fold.projects) {
          const proRef = rootState.firestore.collection('projects').doc(i)
          batch.delete(proRef)
        }

        batch.commit()
      }
    },
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid) {
        rootState.firestore.collection('foldersOrder').doc(rootState.uid)
          .onSnapshot(snap => {
            const data = snap.data()
            if (data)
              state.foldersOrder = data.order
          })
        rootState.firestore.collection('folders').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
          const changes = snap.docChanges()
            appUtils.fixStoreChanges(state, changes, 'folders')
          })
        rootState.firestore.collection('projects').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
            const changes = snap.docChanges()
            appUtils.fixStoreChanges(state, changes, 'projects')
          })
      }
    },
    addFolder({ rootState }, name) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('folders').add({
          name, projects: [],
          userId: rootState.uid,
        })
    },
    saveFoldersOrder({ rootState }, ids) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('foldersOrder').doc(rootState.uid).update({
          order: ids,
        })
    },
  } as Actions,
}
