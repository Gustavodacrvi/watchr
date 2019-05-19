

let open: any = localStorage.getItem('watchrSavedopen');
let component = localStorage.getItem('watchrSavedUserSection');
let fixed: any = localStorage.getItem('watchrSavedUserFixedState');

if (open === null) {
  open = true;
} else {
  open = (open === 'true');
}

if (component === '') {
  component = 'overview';
}

if (fixed === null) {
  fixed = true;
} else {
  fixed = (fixed === 'true');
}

export default {
  namespaced: true,
  state: {
    component,
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
    toggleNav(state: any) {
      state.open = !state.open;
      localStorage.setItem('watchrSavedopen', state.open);
    },
    pushComp(state: any, section: string) {
      console.log(section)
      localStorage.setItem('watchrSavedUserSection', section);
      state.section = section;
    },
  },
  actions: {

  },
};
