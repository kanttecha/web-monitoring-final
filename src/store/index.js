import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      isAuthenticated: false,
      userId: null,
      userRole: localStorage.getItem('userRole') || null, // Initialize userRole from local storage
      errorMessage: null
    };
  },
  mutations: {
    setAuthenticated(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
    setUserId(state, userId) {
      state.userId = userId;
    },
    setUserRole(state, userRole) { // Mutation to set userRole
      state.userRole = userRole;
      localStorage.setItem('userRole', userRole);
    },
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    }
  },
  actions: {
    async login({ commit }, { userCredential, userRole }) { // Modify login action to accept userRole
      try {
        commit('setAuthenticated', true);
        commit('setUserId', userCredential.user.uid);
        commit('setUserRole', userRole); // Set userRole in the store
        commit('setErrorMessage', null);
      } catch (error) {
        console.error('Error logging in user:', error.message);
        commit('setErrorMessage', error.message);
      }
    },
    // eslint-disable-next-line no-unused-vars
    async register({ commit }, { firstName, lastName, telephone, email, password }) {
      try {
        // Your registration logic here
        // For example, register the user with Firebase and then commit mutations accordingly
        commit('setAuthenticated', true);
        commit('setErrorMessage', null);
      } catch (error) {
        console.error('Error registering user:', error.message);
        commit('setErrorMessage', error.message);
      }
    }
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    userId: state => state.userId,
    userRole: state => state.userRole, // Getter to retrieve userRole
    errorMessage: state => state.errorMessage
  }
});

export default store;
