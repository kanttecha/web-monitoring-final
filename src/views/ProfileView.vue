<template>
  <div class="profile-container">
    <h2>{{ profileTitle }}</h2>
    <div class="profile-item">
      <strong>First Name:</strong> {{ userProfile.firstName }}
    </div>
    <div class="profile-item">
      <strong>Last Name:</strong> {{ userProfile.lastName }}
    </div>
    <div class="profile-item">
      <strong>Telephone:</strong> {{ userProfile.telephone }}
    </div>
    <div class="profile-item">
      <strong>Email:</strong> {{ userProfile.email }}
    </div>
    <!-- Button to navigate to EditProfileView.vue -->
    <button @click="goToEditProfile" class="button-edit">Edit Profile</button>
  </div>
</template>


<script>
import { auth, firestore } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default {
  data() {
    return {
      userProfile: {
        firstName: '',
        lastName: '',
        telephone: '',
        email: ''
      }
    };
  },
  computed: {
    profileTitle() {
      // Assuming `username` is a field in the retrieved user profile
      return this.userProfile.username ? `${this.userProfile.username} Profile` : 'Profile';
    }
  },
  async mounted() {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userQuery = query(collection(firestore, 'users'), where('userId', '==', userId));
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          this.userProfile = userDoc.data();
        } else {
          console.error('User document not found');
        }
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error fetching user profile: ', error.message);
    }
  },
  methods: {
    goToEditProfile() {
      // Navigate to EditProfileView.vue
      this.$router.push({ name: 'editprofile' });
    }
  }
};
</script>


<style>
/* Add your styling here */
.profile-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.profile-item {
  margin-bottom: 10px;
}

.profile-item strong {
  margin-right: 10px;
}

.button-edit {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.button-edit:hover {
  background-color: #0056b3;
}
</style>
