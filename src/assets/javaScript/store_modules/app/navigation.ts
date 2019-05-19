

let open: any = localStorage.getItem('watchrSavedopen');
let comp = localStorage.getItem('watchrSavedUserComponent');
let fixed: any = localStorage.getItem('watchrSavedUserFixedState');

if (open === null) {
  open = true;
} else {
  open = (open === 'true');
}

if (comp === '') {
  comp = 'overview';
}

if (fixed === null) {
  fixed = true;
} else {
  fixed = (fixed === 'true');
}

if (!fixed) {
  open = false;
}

export default {
  namespaced: true,
  state: {
    component: component,
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
      localStorage.setItem('watchrSavedopen', state.open);
    },
    toggleNav(state: any) {
      state.open = !state.open;
      localStorage.setItem('watchrSavedopen', state.open);
    },
    pushComp(state: any, component: string) {
      localStorage.setItem('watchrSavedUserComponent', component);
      state.component = component;
    },
  },
  actions: {

  },
};
