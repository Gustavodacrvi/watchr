

let comp = localStorage.getItem('watchrSavedUserComponent');
let fixed: any = localStorage.getItem('watchrSavedUserFixedState');

if (comp === '') {
  comp = 'overview';
}

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
    component: comp,
    open,
    fixed,
    section: 'home',
  },
  getters: {

  },
  mutations: {
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
  },
  actions: {

  },
};
