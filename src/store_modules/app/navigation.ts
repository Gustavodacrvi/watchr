

let fixed: any = localStorage.getItem('watchrSavedUserFixedState');

if (fixed === null) {
  fixed = true;
} else {
  fixed = (fixed === 'true');
}

let open = false;
if (fixed) {
  open = true;
}

export default {
  namespaced: true,
  state: {
    clicked: false,
    iconClick: false,
    component: 'today',
    popUp: '',
    open,
    fixed,
    section: 'home',
  },
  getters: {

  },
  mutations: {
    hidePopUp(state: any) {
      state.popUp = '';
    },
    pushPopUp(state: any, component: string) {
      state.popUp = component;
    },
    click(state: any) {
      state.clicked = true;
    },
    iconClick(state: any) {
      state.iconClick = true;
    },
    fallbackClick(state: any) {
      state.clicked = false;
      state.iconClick = false;
    },
    toggleFixed(state: any) {
      state.open = !state.open;
      state.fixed = !state.fixed;
      localStorage.setItem('watchrSavedUserFixedState', state.fixed);
    },
    unFix(state: any) {
      state.fixed = false;
      localStorage.setItem('watchrSavedUserFixedState', '' + false);
    },
    toggleNav(state: any) {
      state.open = !state.open;
    },
    hide(state: any) {
      state.open = false;
    },
    show(state: any) {
      state.open = true;
    },
    pushComp(state: any, component: string) {
      localStorage.setItem('watchrSavedUserComponent', component);
      state.component = component;
    },
    selectSection(state: any, ico: string) {
      state.section = ico;
    },
  },
  actions: {
    doubleKewpress({ state, commit }: any, keys: string) {
      if (keys === 'al') {
        commit('pushPopUp', 'addlabel');
      }
    },
  },
};
