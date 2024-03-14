<template>
  <div class="form-container">
    <div class="form-columns">
      <!-- First Column -->
      <div class="form-column">
        <form @submit.prevent="addScorecard">
          <div class="form-group">
            <label for="placeOfWork">Job Name:</label>
            <input v-model="newScorecard.placeOfWork" type="text" required>
          </div>
          <!-- Additional form input for job type -->
          <div class="form-group">
            <label for="jobType">Job Type:</label>
            <input v-model="newScorecard.jobType" type="text" required>
          </div>

          <!-- Other form inputs -->

          <div class="form-group">
            <label for="postalCode">Postal Code:</label>
            <input v-model="newScorecard.postalCode" type="text" required>
          </div>

          <!-- Display Province, District, Sub-District Lists -->
          <div class="form-group">
            <label for="province">Province:</label>
            <select v-model="newScorecard.province">
              <option v-for="province in provinceList" :key="province">{{ province }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="district">District:</label>
            <select v-model="newScorecard.district">
              <option v-for="district in districtList" :key="district">{{ district }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="subDistrict">Sub-District:</label>
            <select v-model="newScorecard.subDistrict">
              <option v-for="subDistrict in subDistrictList" :key="subDistrict">{{ subDistrict }}</option>
            </select>
          </div>

          <!-- Other form inputs -->
          <div class="form-group">
            <label for="latitude">Latitude:</label>
            <input v-model="newScorecard.latitude" type="number" step="any" required>
          </div>

          <div class="form-group">
            <label for="longitude">Longitude:</label>
            <input v-model="newScorecard.longitude" type="number" step="any" required>
          </div>

          <div class="form-group">
            <label for="serialNumber">Serial Number:</label>
            <input v-model="newScorecard.serialNumber" type="text" required>
          </div>

          <!-- Responsible Person dropdown -->
          <div class="form-group">
            <label for="responsiblePerson">Responsible Person:</label>
            <select v-model="newScorecard.responsiblePersonId" required>
              <option v-for="user in users" :key="user.id" :value="user.id">{{ user.firstName }} {{ user.lastName }}</option>
            </select>
          </div>



          <button class="addinfo" type="submit">Add Information</button>
        </form>
      </div>

      <!-- Second Column -->
      <div class="form-column">
        <form @submit.prevent="addScorecard">
          <div class="form-group" v-for="(camera, index) in newScorecard.rtspCameras" :key="index">
            <label for="rtspCamera">RTSP Camera:</label>
            <input v-model="camera.value" type="text" required>
            <button class="remove-camera" type="button" @click="removeCamera(index)">Remove</button>
          </div>


          <div class="form-group">
            <button class="add-camera" type="button" @click="addCamera">Add Camera</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, addDoc, query, where, getDocs, setDoc} from "firebase/firestore";
import { firestore, auth } from "@/firebase";
import data from "./th-address.json";
import config from '@/config_ip_port_server.js';

export default {
  data() {
    return {
      ipv4: config.ipv4,
      port_web: config.port_web,
      users: [], // Array to hold users data
      newScorecard: {
        placeOfWork: "",
        latitude: "",
        longitude: "",
        postalCode: "",
        serialNumber: "",
        rtspCameras: [{ value: '' }],
        responsiblePersonId: "", // New property to hold responsible person's ID
        jobType: ""
      },
      generatedURL: ""
    };
  },
  computed: {
    filteredData() {
      return data.find(item => item.zipCode === this.newScorecard.postalCode);
    },
    provinceList() {
      return this.filteredData ? this.filteredData.provinceList.map(province => province.provinceName) : [];
    },
    districtList() {
      return this.filteredData ? this.filteredData.districtList.map(district => district.districtName) : [];
    },
    subDistrictList() {
      return this.filteredData ? this.filteredData.subDistrictList.map(subDistrict => subDistrict.subDistrictName) : [];
    }
  },
  async created() {
    // Fetch users data from Firestore collection
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      const usersCollection = collection(firestore, "users");
      const querySnapshot = await getDocs(usersCollection);
      querySnapshot.forEach(doc => {
        this.users.push({ id: doc.id, ...doc.data() });
      });
    },
    async addScorecard() {
      const scorecardCollection = collection(firestore, "job_collection");

      const serialNumberQuery = query(scorecardCollection, where("serialNumber", "==", this.newScorecard.serialNumber));
      const existingScorecards = await getDocs(serialNumberQuery);

      const currentUser = auth.currentUser;
      const uid = currentUser.uid;

      if (!existingScorecards.empty) {
        console.error("Serial number already exists. Please enter a unique serial number.");
        return;
      }

      // Retrieve user document based on UID
      const userDoc = this.users.find(user => user.userId === uid);
      if (!userDoc) {
        console.error("User document not found for UID:", uid);
        return;
      }

      // Extract firstName and lastName from user document
      const { firstName, lastName } = userDoc;

      // Construct job log entry with createdBy
      const currentDate = new Date();
      const formattedTimestamp = currentDate.toUTCString();
      const jobLogEntry = {
        action: 'created',
        timestamp: formattedTimestamp,
        createdBy: `${firstName} ${lastName}`
      };


      // Add job log entry to the new scorecard
      this.newScorecard.jobLog = [jobLogEntry];

      this.generatedURL = `http://${this.ipv4}:${this.port_web}/hls/${this.newScorecard.serialNumber}`;
      this.newScorecard.url = this.generatedURL;

    try {
        // Add scorecard to Firestore
        const docRef = await addDoc(scorecardCollection, this.newScorecard);

        // Get the ID of the newly created document
        const newDocId = docRef.id;

        // Update the newScorecard object with the document ID
        this.newScorecard.id = newDocId;

        // Update the document in Firestore with the added ID field using set method
        await setDoc(docRef, { id: newDocId }, { merge: true });

        console.log("Scorecard information added successfully.");

        // Reset newScorecard fields after successful addition
        this.newScorecard = {
            placeOfWork: "",
            latitude: "",
            longitude: "",
            postalCode: "",
            serialNumber: "",
            rtspCamera: [],
            responsiblePersonId: "", // Reset responsiblePersonId
            jobType: ""
        };

        this.$router.push({ name: 'home' });
    } catch (error) {
        console.error("Error adding scorecard information:", error);
    }
},


    addCamera() {
      this.newScorecard.rtspCameras.push({ value: '' });
    },

    removeCamera(index) {
      this.newScorecard.rtspCameras.splice(index, 1);
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

input, select {
  width: 100%;
  padding: 10px; /* Increase padding for better appearance */
  border: 1px solid #ccc; /* Add a border */
  border-radius: 5px; /* Add rounded corners */
  transition: border-color 0.3s ease; /* Smooth transition for border color */
}

input:focus, select:focus {
  outline: none; /* Remove the default focus outline */
  border-color: #66afe9; /* Change border color on focus */
}

.addinfo {
  margin-top: 16px;
  padding: 10px 20px; /* Add padding to the button */
  background-color: #1c782b; /* Set background color */
  color: #fff; /* Set text color */
  border: none; /* Remove border */
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer; /* Add cursor pointer on hover */
  transition: background-color 0.3s ease; /* Smooth transition for background color */
}

.addinfo:hover {
  background-color: #0056b3; /* Change background color on hover */
}

.remove-camera{
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #dc3545; /* Red for remove button and green for add button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-camera:hover{
  background-color: #c82333; /* Darker red for remove button and darker green for add button on hover */
}

.add-camera {
  padding: 8px 16px; /* Adjust padding for smaller buttons */
  background-color: #1c782b; /* Red for remove button and green for add button */
  color: #fff;
  border: none;
  border-radius: 5px; /* Add rounded corners */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-camera:hover {
  background-color:  #0056b3; /* Darker red for remove button and darker green for add button on hover */
}
</style>

