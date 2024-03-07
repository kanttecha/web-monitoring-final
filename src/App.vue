<template>
  <div id="app">
    <nav>
      <router-link to="/home" class="nav-link" active-class="active-link">JOB SUMMARY</router-link>
      <router-link to="/insert" class="nav-link" active-class="active-link">JOB LOCATION</router-link>
      <router-link to="/hls" class="nav-link" active-class="active-link">JOB STREAMING</router-link>
      <router-link to="/about" class="nav-link" active-class="active-link">ADD JOB</router-link>
      <router-link v-if="isAdmin" to="/panel" class="nav-link" active-class="active-link">ADMIN PANEL</router-link>
      <div v-if="isLoggedIn" class="user-section">
        <router-link :to="'/profile'">
          <img src="/user_icon.png" alt="User Icon" class="user-icon" />
        </router-link>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>


    </nav>
    <router-view />
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref } from 'vue';
import { auth, firestore } from './firebase'; // Adjust the path to your firebase.js file
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router'; // Import useRouter from vue-router

export default {
  name: 'App',
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    const username = ref('');
    const router = useRouter(); // Get the router instance

    // Check if the user is already logged in
    onAuthStateChanged(auth, async (user) => {
      isLoggedIn.value = !!user;
      
      if (user) {
        const userId = user.uid;
        const userQuery = query(collection(firestore, 'users'), where('userId', '==', userId));
        const querySnapshot = await getDocs(userQuery);

        querySnapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.role === 'admin') {
            isAdmin.value = true;
          }
          username.value = userData.username; // Set the username
        });
      }
    });

    const logout = async () => {
      try {
        await signOut(auth);
        console.log('User logged out successfully');
        // Redirect to the login page after logout
        router.push({ name: 'login' });
      } catch (error) {
        console.error('Error logging out:', error.message);
      }
    };

    return {
      isLoggedIn,
      isAdmin,
      username,
      logout
    };
  }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  display: flex;
  justify-content: space-between; /* Aligns items with space between them */
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%; /* Ensure nav takes full width */
}

.nav-link {
  font-weight: bold;
  color: #333;
  text-decoration: none;
  margin: 0 10px;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #007bff;
}

.active-link {
  color: #007bff;
}

.logout-btn {
  padding: 8px 12px;
  font-weight: bold;
  color: #fff;
  background-color: #dc3545;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #c82333;
}

.username {
  color: #333;
  text-decoration: none;
}

.user-section {
  display: flex;
  align-items: center;
}
.user-icon {
  width: 50px; /* Adjust the width as needed */
  height: 50px; /* Adjust the height as needed */
  border-radius: 50%; /* Make the image round */

}

</style>
