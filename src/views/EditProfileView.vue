<template>
  <div class="edit-profile-container">
    <h2>Edit {{ updatedProfile.username }}'s Profile</h2>
    <form @submit.prevent="updateProfile">
      <div class="form-group">
        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" v-model="updatedProfile.firstName" required>
      </div>
      <div class="form-group">
        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" v-model="updatedProfile.lastName" required>
      </div>
      <div class="form-group">
        <label for="telephone">Telephone:</label>
        <input type="tel" id="telephone" v-model="updatedProfile.telephone" required>
      </div>
      <div class="form-group">
        <label for="newPassword">New Password:</label>
        <div class="password-input">
          <input :type="newPasswordFieldType" id="newPassword" v-model="updatedProfile.newPassword">
          <img
            :src="showNewPassword ? 'eye.png' : 'hidden.png'"
            alt="Toggle New Password Visibility"
            class="password-icon"
            @click="toggleNewPasswordVisibility"
          />
        </div>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <div class="password-input">
          <input :type="confirmPasswordFieldType" id="confirmPassword" v-model="confirmPassword">
          <img
            :src="showConfirmPassword ? 'eye.png' : 'hidden.png'"
            alt="Toggle Confirm Password Visibility"
            class="password-icon"
            @click="toggleConfirmPasswordVisibility"
          />
        </div>
      </div>
      <button type="submit" class="button-save">Save Changes</button>
      <!-- Display success message if profile was successfully updated -->
      <p v-if="profileUpdated" class="success-message">Profile updated successfully!</p>
    </form>
  </div>
</template>

<script>
import { auth, firestore } from '@/firebase';
import { getDocs, collection, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

export default {
  data() {
    return {
      updatedProfile: {
        firstName: '',
        lastName: '',
        telephone: '',
        email: '',
        newPassword: ''
      },
      confirmPassword: '', // Confirm password field
      profileUpdated: false,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  async mounted() {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const usersCollectionRef = collection(firestore, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        querySnapshot.forEach(doc => {
          const userData = doc.data();
          if (userData.userId === userId) {
            this.updatedProfile = { ...userData };
          }
        });
      } else {
        console.error('User not authenticated');
      }
    } catch (error) {
      console.error('Error fetching user profile: ', error.message);
    }
  },
  methods: {
    async updateProfile() {
      try {
        const user = auth.currentUser;
        if (user) {
          const userId = user.uid;
          const usersCollectionRef = collection(firestore, 'users');
          const querySnapshot = await getDocs(usersCollectionRef);

          querySnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.userId === userId) {
              const userDocRef = doc.ref;
              const { newPassword, ...profileData } = this.updatedProfile;

              // Check if a new password is provided and validate
              if (newPassword && newPassword !== this.confirmPassword) {
                window.alert('Passwords do not match');
                return; // Exit method if passwords do not match
              }

              // Update profile data
              updateDoc(userDocRef, profileData).then(() => {
                if (newPassword) {
                  // Update password only if a new password is provided
                  updatePassword(user, newPassword).then(() => {
                    console.log('Password updated successfully');
                  }).catch(error => {
                    console.error('Error updating password:', error.message);
                  });
                }

                this.$router.push({ name: 'profile' });
                this.profileUpdated = true;
              }).catch(error => {
                console.error('Error updating user profile:', error.message);
              });
            }
          });
        } else {
          console.error('User not authenticated');
        }
      } catch (error) {
        console.error('Error updating user profile:', error.message);
      }
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  },
  computed: {
    newPasswordFieldType() {
      return this.showNewPassword ? 'text' : 'password';
    },
    confirmPasswordFieldType() {
      return this.showConfirmPassword ? 'text' : 'password';
    }
  }
};
</script>

<style scoped>
/* Add your styling here */
.edit-profile-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  text-align: left;
  padding-left: 25px;
}

input[type="text"],
input[type="tel"],
input[type="email"],
input[type="password"] {
  width: calc(100% - 50px); /* Adjusted width to accommodate icon */
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.button-save {
  width: 85%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.password-input {
  position: relative;
}

.password-icon {
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  padding-right: 25px;
}
</style>


