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
            <select v-model="editedItem.responsiblePersonId" required>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
            </select>
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
import { doc, getDoc, updateDoc ,collection,getDocs} from 'firebase/firestore';
import { firestore,auth } from '@/firebase';

export default {
  data() {
    return {
      editedItem: {
        placeOfWork: '',
        latitude: '',
        longitude: '',
        serialNumber: '',
        rtspCameras: [{ value: '' }],
        responsiblePersonId: '', // Changed to responsiblePersonId
        jobType: '',
        province: '',
        district: '',
        subDistrict: '',
        postalCode: ''
      },
      users: [], // Array to hold users data
    };
  },
  async mounted() {
    const itemId = this.$route.params.id;
    await this.fetchScorecardItem(itemId);
    await this.fetchUsers(); // Fetch users data when component is mounted
  },
  methods: {
    async fetchScorecardItem(itemId) {
      const scorecardDocRef = doc(firestore, 'job_collection', itemId);
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
    async fetchUsers() {
      const usersCollection = collection(firestore, "users");
      const querySnapshot = await getDocs(usersCollection);
      querySnapshot.forEach(doc => {
        this.users.push({ id: doc.id, ...doc.data() });
      });
    },
async updateScorecard() {
  const itemId = this.$route.params.id;
  const scorecardDocRef = doc(firestore, 'job_collection', itemId);

  try {
    // Fetch the current document data
    const docSnapshot = await getDoc(scorecardDocRef);
    if (!docSnapshot.exists()) {
      console.error('Document does not exist!');
      return;
    }

    const scorecardData = docSnapshot.data();

    // Construct log entry
    const currentUser = auth.currentUser;
    const uid = currentUser.uid;
    const userDoc = this.users.find(user => user.userId === uid);
    if (!userDoc) {
      console.error("User document not found for UID:", uid);
      return;
    }
    const { firstName, lastName } = userDoc;
    const formattedTimestamp = new Date().toUTCString();
    const logEntry = {
      action: 'edit',
      timestamp: formattedTimestamp,
      editedBy: `${firstName} ${lastName}`,
      changes: [], // Initialize array to store changes
    };

    // Compare editedItem with scorecardData to identify changes
    for (const key in this.editedItem) {
      if (Object.prototype.hasOwnProperty.call(this.editedItem, key) && key !== 'id' && key !== 'jobLog') {
        if (this.editedItem[key] !== scorecardData[key]) {
          // Log the change
          logEntry.changes.push({
            field: key,
            oldValue: scorecardData[key],
            newValue: this.editedItem[key]
          });
        }
      }
    }

    // Update the document with the new log entry
    const updatedJobLog = [...scorecardData.jobLog, logEntry];
    
    // Update the document with the edited data and the updated jobLog
    await updateDoc(scorecardDocRef, { ...this.editedItem, jobLog: updatedJobLog });
    console.log('Document successfully updated with new log entry!');

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

select,
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

select:focus {
  outline: none; /* Remove the default focus outline */
  border-color: #66afe9; /* Change border color on focus */
}


.add-camera,
button[type="submit"] {
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #1c782b; /* Green for add button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}



.remove-camera{
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #e03030; /* Green for add button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-camera:hover,
.add-camera:hover,
button[type="submit"]:hover {
  background-color: #0056b3; /* Darker green for add button on hover */
}

</style>
