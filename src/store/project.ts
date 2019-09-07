

import { State, Getters, ProjectActions } from '@/interfaces/store/project'
import appUtils from '@/utils/app'
import { Folder, Project } from '@/interfaces/app'

import timezone from 'moment-timezone'
import undefined from 'firebase/empty-import'

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
  deleteProjectTask: ProjectActions.StoreDeleteProjectTask
  updateProjectTasks: ProjectActions.StoreUpdateProjectTasks
  addProjectHeadings: ProjectActions.StoreAddProjectHeadings
  deleteHeadingById: ProjectActions.StoreDeleteHeadingById
  updateHeadingsOrder: ProjectActions.StoreUpdateHeadingsOrder
  updateHeadingsTaskOrder: ProjectActions.StoreUpdateHeadingsTaskOrder
  addProjectHeadingTask: ProjectActions.StoreAddProjectHeadingTask
  deleteProjectHeadingTask: ProjectActions.StoreDeleteProjectHeadingTask
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
    deleteHeadingById({ rootState, state }, {headingId, projectId}) {
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === projectId)
        if (project) {
          const headings = project.headings.slice()
          const i = headings.findIndex(el => el.id === headingId)
          if (i > -1) {
            const fire = rootState.firebase.firestore.FieldValue as any
            const ids = headings[i].tasks.slice()
            headings.splice(i, 1)

            rootState.firestore.collection('projects').doc(projectId).update({
              tasks: fire.arrayUnion(...ids),
              headings,
            })
          }
        }
      }
    },
    deleteProjectTask({ rootState }, {taskId, projectId}) {
      if (rootState.firestore && rootState.uid) {
        const fire = rootState.firebase.firestore.FieldValue as any
        const batch = rootState.firestore.batch()

        const taskRef = rootState.firestore.collection('tasks').doc(taskId)
        batch.delete(taskRef)

        const proRef = rootState.firestore.collection('projects').doc(projectId)
        batch.update(proRef, {
          tasks: fire.arrayRemove(taskId),
        })

        batch.commit()
      }
    },
    updateHeadingsOrder({ rootState, state }, {ids, projectId}) {
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === projectId)
        if (project) {
          const headings = []
          for (const id of ids) {
            const head = project.headings.find(el => el.id === id)
            if (head) headings.push(head)
          }
          rootState.firestore.collection('projects').doc(projectId).update({
            headings,
          })
        }
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
    addProjectHeadings({ rootState, state }, {index, name, id, ids}) {
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === id)
        
        if (project) {
          const fire = rootState.firebase.firestore.FieldValue as any

          let newId = project.headings.length
          while (true) {
            if (project.headings.find(el => el.id === '' + newId)) {
              newId++
              continue
            }
            break
          }

          const headings = project.headings.slice()
          headings.splice(index, 0, {
            id: '' + newId,
            tasks: ids, name,
          })
          if (ids.length > 0)
            rootState.firestore.collection('projects').doc(id).update({
              headings,
              tasks: fire.arrayRemove(...ids),
            })
          else 
            rootState.firestore.collection('projects').doc(id).update({
              headings,
            })
        }
      }
    },
    updateProjectTasks({ rootState }, {id, ids}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('projects').doc(id).update({
          tasks: ids,
        })
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
    deleteProjectHeadingTask({ rootState, state }, {taskId, projectId, headingId}) {
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === projectId)
        if (project) {
          const headings = project.headings.slice()
          const i = headings.findIndex(el => el.id === headingId)
          if (i > -1) {
            const batch = rootState.firestore.batch()
            const j = headings[i].tasks.findIndex(el => el === taskId)
            headings[i].tasks.splice(j, 1)
            const taskRef = rootState.firestore.collection('tasks').doc(taskId)
            batch.delete(taskRef)
            const proRef = rootState.firestore.collection('projects').doc(projectId)
            batch.update(proRef, {headings})
            batch.commit()
          }
        }
      }
    },
    addProjectHeadingTask({ rootState, state }, {projectId, headingId, task, order, position}) {
      const u = timezone().utc()
      const date = u.format('Y-M-D HH:mm')
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === projectId)
        if (project) {
          const headings = project.headings.slice()
          const i = headings.findIndex(el => el.id === headingId)
          if (i > -1) {
            const batch = rootState.firestore.batch()

            const ord = order.slice()
            const ref = rootState.firestore.collection('tasks').doc()
            ord.splice(position, 0, ref.id)
            headings[i].tasks = ord
            const t = task as any
            batch.set(ref, {
              projectId,
              name: task.name,
              priority: task.priority,
              userId: rootState.uid,
              creationDate: date,
              lastEditDate: date,
              labels: task.labels,
              checklist: [],
              completed: false,
              checklistOrder: [],
              ...t.utc,
            })
            const persRef = rootState.firestore.collection('projects').doc(projectId)
            batch.update(persRef, {
              headings,
            })
    
            batch.commit()
          }
        }
      }
    },
    updateHeadingsTaskOrder({ rootState, state }, {projectId, ids, headingId}) {
      if (rootState.firestore && rootState.uid) {
        const project = state.projects.find(el => el.id === projectId)
        if (project) {
          const headings = project.headings.slice()
          const i = project.headings.findIndex(el => el.id === headingId)
          if (i > -1) {
            headings[i].tasks = ids
            rootState.firestore.collection('projects').doc(projectId).update({
              headings,
            })
          }
        }
      }
    },
    saveFoldersOrder({ rootState }, ids) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('foldersOrder').doc(rootState.uid).update({
          order: ids,
        })
    },
  } as Actions,
}
