<template>
  <div>
    <form @submit.prevent="updateScorecard" class="form-container">
      <div class="form-columns">
        <!-- First Column -->
        <div class="form-column">
          <div class="form-group">
            <label for="placeOfWork">Job Name:</label>
            <input v-model="editedItem.placeOfWork" type="text" id="placeOfWork" required>
          </div>

                    <!-- Additional inputs for jobType, province, district, subDistrict, and postalCode -->
          <div class="form-group">
            <label for="jobType">Job Type:</label>
            <input v-model="editedItem.jobType" type="text" id="jobType" required>
          </div>

          <div class="form-group">
            <label for="province">Province:</label>
            <input v-model="editedItem.province" type="text" id="province" required>
          </div>

          <div class="form-group">
            <label for="district">District:</label>
            <input v-model="editedItem.district" type="text" id="district" required>
          </div>

          <div class="form-group">
            <label for="subDistrict">Sub-District:</label>
            <input v-model="editedItem.subDistrict" type="text" id="subDistrict" required>
          </div>

          <div class="form-group">
            <label for="postalCode">Postal Code:</label>
            <input v-model="editedItem.postalCode" type="text" id="postalCode" required>
          </div>

          <div class="form-group">
            <label for="latitude">Latitude:</label>
            <input v-model="editedItem.latitude" type="number" step="any" id="latitude" required>
          </div>

          <div class="form-group">
            <label for="longitude">Longitude:</label>
            <input v-model="editedItem.longitude" type="number" step="any" id="longitude" required>
          </div>

          <div class="form-group">
            <label for="serialNumber">Serial Number:</label>
            <input v-model="editedItem.serialNumber" type="text" id="serialNumber" required disabled>
          </div>

          <div class="form-group">
            <label for="responsiblePerson">Responsible Person:</label>
            <input v-model="editedItem.responsiblePerson" type="text" required>
          </div>
          <button class="updatebutton" type="submit">Update</button>
        </div>

        <!-- Second Column -->
        <div class="form-column">
          <div class="form-group" v-for="(camera, index) in editedItem.rtspCameras" :key="index">
            <label for="rtspCamera">RTSP Camera:</label>
            <input v-model="camera.value" type="text" required>
            <button class="remove-camera" type="button" @click="removeCamera(index)">Remove</button>
          </div>

          <!-- Display the generated URL -->
          <div class="form-group">
            <button class="add-camera" type="button" @click="addCamera">Add Camera</button>
          </div>
          

        </div>
      </div>

      
    </form>
  </div>
</template>

<script>
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';

export default {
  data() {
    return {
      editedItem: {
        placeOfWork: '',
        latitude: '',
        longitude: '',
        serialNumber: '',
        rtspCameras: [{ value: '' }],
        responsiblePerson: '',
        jobType: '',
        province: '',
        district: '',
        subDistrict: '',
        postalCode: ''
      },
    };
  },
  async mounted() {
    const itemId = this.$route.params.id;
    await this.fetchScorecardItem(itemId);
  },
  methods: {
    async fetchScorecardItem(itemId) {
      const scorecardDocRef = doc(firestore, 'your_collection', itemId);
      try {
        const docSnapshot = await getDoc(scorecardDocRef);
        if (docSnapshot.exists()) {
          this.editedItem = { id: docSnapshot.id, ...docSnapshot.data() };
        } else {
          console.error('Document does not exist!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    },
    async updateScorecard() {
      const itemId = this.$route.params.id;
      const scorecardDocRef = doc(firestore, 'your_collection', itemId);

      try {
        // Update the document with the edited data
        await updateDoc(scorecardDocRef, this.editedItem);
        console.log('Document successfully updated!');

        // Redirect back to the home page or another appropriate page
        this.$router.push({ name: 'home' });
      } catch (error) {
        console.error('Error updating document:', error);
        // Handle error or display a message to the user
      }
    },
    addCamera() {
      this.editedItem.rtspCameras.push({ value: '' }); // Add an empty string for a new camera value
    },
    removeCamera(index) {
      this.editedItem.rtspCameras.splice(index, 1); // Remove the camera at the specified index
    },
  },
};
</script>

<style scoped>
/* Adjusted styling for the form */
.form-container {
  max-width: 800px; /* Adjust as needed */
  margin: auto;
  padding-top: 50px;
}

.form-columns {
  display: flex;
  gap: 20px; /* Adjust the gap between columns */
}

.form-column {
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px; /* Add some spacing between label and input */
  text-align: left;
  font-weight: bold; /* Make the label bold */
  color: #333; /* Darken the label color */
}

input {
  width: 100%;
  padding: 10px; /* Increase padding for better appearance */
  border: 1px solid #ccc; /* Add a border */
  border-radius: 5px; /* Add rounded corners */
  transition: border-color 0.3s ease; /* Smooth transition for border color */
}

input:focus {
  outline: none; /* Remove the default focus outline */
  border-color: #66afe9; /* Change border color on focus */
}

.remove-camera {
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #dc3545; /* Red for remove button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-camera:hover {
  background-color: #c82333; /* Darker red for remove button on hover */
}

.add-camera {
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #1c782b; /* Green for add button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-camera:hover {
  background-color: #0056b3; /* Darker green for add button on hover */
}

button[type="submit"] {
  margin-top: 16px; /* Add margin-top to separate from other buttons */
}
.updatebutton {
  margin-top: 16px;
  padding: 10px 20px; /* Add padding to the button */
  background-color: #1c782b; /* Set background color */
  color: #fff; /* Set text color */
  border: none; /* Remove border */
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer; /* Add cursor pointer on hover */
  transition: background-color 0.3s ease; /* Smooth transition for background color */
}

.updatebutton:hover {
  background-color: #0056b3; /* Change background color on hover */
}
</style>
