import { createStore } from 'vuex';

// Create a new Vuex store instance
const store = createStore({
  // Define the initial state of the store
  state() {
    return {
      // Initially, the user is not authenticated
      isAuthenticated: false,
      // Initialize userId as null
      userId: null,
      // Initialize userRole from local storage or as null if not found
      userRole: localStorage.getItem('userRole') || null,
      // Initialize errorMessage as null
      errorMessage: null
    };
  },
  // Define mutations to modify the state
  mutations: {
    // Mutation to update isAuthenticated state
    setAuthenticated(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
    // Mutation to update userId state
    setUserId(state, userId) {
      state.userId = userId;
    },
    // Mutation to update userRole state and store it in local storage
    setUserRole(state, userRole) {
      state.userRole = userRole;
      localStorage.setItem('userRole', userRole);
    },
    // Mutation to update errorMessage state
    setErrorMessage(state, errorMessage) {
      state.errorMessage = errorMessage;
    }
  },
  // Define actions to perform asynchronous operations and commit mutations
  actions: {
    // Action to handle user login
    async login({ commit }, { userCredential, userRole }) {
      try {
        // Update isAuthenticated, userId, and userRole states
        commit('setAuthenticated', true);
        commit('setUserId', userCredential.user.uid);
        commit('setUserRole', userRole);
        // Reset errorMessage
        commit('setErrorMessage', null);
      } catch (error) {
        console.error('Error logging in user:', error.message);
        // Update errorMessage state if an error occurs
        commit('setErrorMessage', error.message);
      }
    },
    // Action to handle user registration
    // eslint-disable-next-line no-unused-vars
    async register({ commit }, { firstName, lastName, telephone, email, password }) {
      try {
        // Your registration logic here
        // For example, register the user with Firebase and then commit mutations accordingly
        // Update isAuthenticated state
        commit('setAuthenticated', true);
        // Reset errorMessage
        commit('setErrorMessage', null);
      } catch (error) {
        console.error('Error registering user:', error.message);
        // Update errorMessage state if an error occurs
        commit('setErrorMessage', error.message);
      }
    }
  },
  // Define getters to retrieve state values
  getters: {
    // Getter to retrieve isAuthenticated state
    isAuthenticated: state => state.isAuthenticated,
    // Getter to retrieve userId state
    userId: state => state.userId,
    // Getter to retrieve userRole state
    userRole: state => state.userRole,
    // Getter to retrieve errorMessage state
    errorMessage: state => state.errorMessage
  }
});

// Export the Vuex store instance
export default store;
