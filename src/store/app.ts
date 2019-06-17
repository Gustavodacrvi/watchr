
interface States {

}

interface Mutations {
  setDefaultData: () => void
  [key: string]: (state: States, payload: any) => any
}

export default {
  namespaced: true,
  state: {

  } as States,
  mutations: {
    setDefaultData() {

    },
  } as Mutations,
}
