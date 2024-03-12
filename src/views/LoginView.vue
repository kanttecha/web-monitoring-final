<template>
  <div class="login-container">
    <h2>Login</h2>
    <div class="input-group">
      <input v-model="email" type="email" placeholder="Email" required>
    </div>
    <div class="input-group" style="position: relative;">
      <input v-model="password" ref="passwordInput" :type="showPassword ? 'text' : 'password'" placeholder="Password" required>
      <img
        v-if="!showPassword"
        src="hidden.png"
        alt="Show Password"
        class="password-icon"
        @click="togglePasswordVisibility"
      />
      <img
        v-else
        src="eye.png"
        alt="Hide Password"
        class="password-icon"
        @click="togglePasswordVisibility"
      />
    </div>
    <button class="buttonlogin" @click="login">Login</button>
    
    <!-- Error notification container -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
  <div class="register-link">
    <router-link :to="{ name: 'register' }">Don't have an account? Register here</router-link>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs,updateDoc } from 'firebase/firestore';
import { auth, firestore } from '@/firebase';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '', // Added errorMessage property
      showPassword: false // Added showPassword property
    };
  },
  methods: {
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log('User logged in successfully', userCredential.user);

        // Console log the UID from Firebase Authentication
        console.log('User UID:', userCredential.user.uid);

        localStorage.setItem('isAuthenticated', true);

        // Fetch user role from Firestore
        const usersCollection = collection(firestore, 'users');
        const userQuery = query(usersCollection, where('userId', '==', userCredential.user.uid));
        const querySnapshot = await getDocs(userQuery);

        // Inside the login method after fetching user role from Firestore
        if (!querySnapshot.empty) {
          const userDocRef = querySnapshot.docs[0].ref;
          const userDocData = querySnapshot.docs[0].data();
          const lastSignInTime = userCredential.user.metadata.lastSignInTime;

          // Get the current login log array or create an empty array if it doesn't exist
          const loginLogArray = userDocData.loginlog || [];

          // Append the new login timestamp to the login log array
          loginLogArray.push(lastSignInTime);

          // Update the login log in Firestore
          await updateDoc(userDocRef, { loginlog: loginLogArray });

          const role = userDocData.role;
          console.log('User role:', role);
          
          // Dispatch login action with userRole
          this.$store.dispatch('login', { userCredential, userRole: role });

          // Store user role in local storage
          localStorage.setItem('userRole', role);

          // Redirect to home page
          this.$router.push({ name: 'home' });
        } else {
          console.error('User data not found in Firestore');
        }
      } catch (error) {
        console.error('Login error:', error.message);
        this.errorMessage = error.message; // Set errorMessage property
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
      const passwordInput = this.$refs.passwordInput;
      if (this.showPassword) {
        passwordInput.classList.add('show-password');
      } else {
        passwordInput.classList.remove('show-password');
      }
    },

  }
};
</script>

<style>
/* Add your styling here */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.input-group {
  margin-bottom: 20px;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px 35px 10px 10px; /* Adjusted padding to accommodate the icon */
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.show-password{
  width: 100%;
  padding: 10px 35px 10px 10px; /* Adjusted padding to accommodate the icon */
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.buttonlogin {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.buttonlogin:hover {
  background-color: #0056b3;
}

.register-link {
  text-align: center;
}

.error-message {
  background-color: #ffcccc;
  color: #ff0000;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.password-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
}
</style>
