<template>
  <div id="app">
    <!-- Navigation bar -->
    <nav>
      <!-- Navigation links -->
      <router-link to="/home" class="nav-link" active-class="active-link">JOB SUMMARY</router-link>
      <router-link to="/insert" class="nav-link" active-class="active-link">JOB LOCATION</router-link>
      <router-link to="/hls" class="nav-link" active-class="active-link">JOB STREAMING</router-link>
      <router-link to="/about" class="nav-link" active-class="active-link">ADD JOB</router-link>
      <router-link v-if="isAdmin" to="/panel" class="nav-link" active-class="active-link">ADMIN PANEL</router-link>
      
      <!-- User section -->
      <div v-if="isLoggedIn" class="user-section">
        <router-link :to="'/profile'">
          <img src="/user_icon.png" alt="User Icon" class="user-icon" />
        </router-link>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>


    <!-- Mini window alerts temp -->
    <div class="mini-window-container">
      <div v-for="(alert, index) in alerts" :key="index" class="mini-window">
        <div class="alert alert-danger d-flex align-items-center" role="alert">
          <svg class="bi flex-shrink-0 me-2 alert-icon" width="24" height="24" role="img" aria-label="Danger:">
            <use xlink:href="#exclamation-triangle-fill"/>
          </svg>
          <div class="alert-message">
            {{ alert.placeOfWork }} Temperature is greater than or equal to 40 .
          </div>
        </div>
      </div>
    </div>

    <!-- Router view for displaying other components -->
    <router-view />
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onMounted } from 'vue'; // Import onMounted from Vue
import { auth, firestore } from './firebase';
import { collection, query, where, onSnapshot,getDocs } from 'firebase/firestore';
import { useRouter } from 'vue-router';

export default {
  name: 'App',
  setup() {
    const isLoggedIn = ref(false);
    const isAdmin = ref(false);
    const username = ref('');
    const router = useRouter();
    const alerts = ref([]);

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
          username.value = userData.username;
        });
      }
    });

    const logout = async () => {
      try {
        await signOut(auth);
        console.log('User logged out successfully');
        router.push({ name: 'login' });
      } catch (error) {
        console.error('Error logging out:', error.message);
      }
    };

    const fetchTemperatureAlerts = () => {
      const querySnapshot = collection(firestore, 'your_collection');
      const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
        alerts.value = []; // Clear previous alerts
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.temperature >= 40) {
            alerts.value.push(data);
          }
        });
      });
      return unsubscribe; // Return the unsubscribe function
    };

    // Call fetchTemperatureAlerts on component mount
    onMounted(fetchTemperatureAlerts);

    return {
      isLoggedIn,
      isAdmin,
      username,
      logout,
      alerts
    };
  }
};
</script>

<style scoped>
/* Styles for the app */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

/* Styles for the navigation bar */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
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
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

/* Styles for the mini window alerts */
.mini-window-container {
  position: fixed;
  top: 50px; /* Adjust top position as needed */
  right: 20px; /* Adjust right position as needed */
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 10px;
  z-index: 999; /* Ensure it's on top of other content */
}

.mini-window {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 5px;
}

.alert-icon {
  flex-shrink: 0;
  margin-right: 10px;
}

.alert-message {
  flex-grow: 1;
}
</style>
