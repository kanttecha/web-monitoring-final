<template>
  <div class="table-container">
    <div class="google-map-container">
      <div class="google_map1">
        <MapView />
      </div>
      <router-link to="/about" class="add-job-button">ADD JOB</router-link>
    </div>




    <table>
      <!-- Table Header -->
      <thead>
        <!-- Table Header Rows -->
        <tr>
          <th>Job Name</th>
          <th>Job Type</th>
          <th>Job Location</th>
          <th>Serial Number</th>
          <th v-if="isAuthorizedToViewRtspCamera">RTSP Camera</th>
          <th>Responsible Person</th>
          <th>Action</th>
        </tr>
      </thead>
      <!-- Table Body -->
      <tbody>
        <!-- Loop through displayed data -->
        <tr v-for="(item, index) in paginatedData" :key="index">
          <!-- Table Data Cells -->
          <td>{{ item.placeOfWork }}</td>
          <td>{{ item.jobType }}</td>
          <td>{{ item.province }}, {{ item.district }}, {{ item.subDistrict }}, {{ item.postalCode }}</td>
          <td>{{ item.serialNumber }}</td>
          <td v-if="isAuthorizedToViewRtspCamera">
            <ul>
              <li v-for="(camera, cameraIndex) in item.rtspCameras" :key="cameraIndex">
                {{ camera.value }}
              </li>
            </ul>
          </td>
          <td>{{ item.responsiblePerson }}</td>
          <td>
            <div class="action-buttons">
              <button v-if="isAuthorizedToEdit" class="edit" @click="editScorecardItem(item.id)">Edit</button>
              <button v-if="isAuthorizedToDelete" class="delete" @click="deleteScorecardItem(item.id)">Delete</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination and Search -->
    <div class="pagination-search-container">
      <!-- Pagination Controls -->
      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
      <!-- Search Input -->
      <div class="search-container">
        <input v-model="searchQuery" type="text" @input="handleSearch" placeholder="Search...">
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/firebase";
import MapView from '@/components/MapView.vue';
import store from '@/store';

export default {
  components: {
    MapView,
  },
  data() {
    return {
      scorecardData: [],
      currentPage: 1,
      itemsPerPage: 5,
      searchQuery: "",
      
    };
  },
  computed: {
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredData.slice(startIndex, endIndex);
    },
    filteredData() {
      return this.scorecardData.filter(item => {
        const searchRegex = new RegExp(this.searchQuery.trim(), "i");
        return (
          searchRegex.test(item.placeOfWork) ||
          searchRegex.test(item.jobType) ||
          searchRegex.test(item.province) ||
          searchRegex.test(item.district) ||
          searchRegex.test(item.subDistrict) ||
          searchRegex.test(item.postalCode) ||
          searchRegex.test(item.latitude) ||
          searchRegex.test(item.longitude) ||
          searchRegex.test(item.serialNumber) ||
          searchRegex.test(item.responsiblePerson) ||
          (this.isAuthorizedToViewRtspCamera && item.rtspCameras.some(camera => searchRegex.test(camera.value)))
        );
      });
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    isAuthorizedToDelete() {
      const userRole = store.getters.userRole;
      return userRole === 'admin' || userRole === 'web_admin';
    },
    isAuthorizedToEdit() {
      const userRole = store.getters.userRole;
      return userRole === 'admin' || userRole === 'web_admin';
    },
    isAuthorizedToViewRtspCamera() {
      const userRole = store.getters.userRole;
      return userRole === 'admin' || userRole === 'web_admin';
    },
  },
  mounted() {
    this.fetchScorecardData();
  },
  methods: {
    async fetchScorecardData() {
      const scorecardCollection = collection(firestore, "your_collection");
      try {
        const querySnapshot = await getDocs(scorecardCollection);
        this.scorecardData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.checkTemperatureAlert();
      } catch (error) {
        console.error("Error fetching scorecard data:", error);
      }
    },





    deleteScorecardItem(itemId) {
      if (confirm("Are you sure you want to delete this item?")) {
        this.performDelete(itemId);
      }
    },
    async performDelete(itemId) {
      try {
        const scorecardDocRef = doc(firestore, "your_collection", itemId);
        await deleteDoc(scorecardDocRef);
        this.scorecardData = this.scorecardData.filter((item) => item.id !== itemId);
        console.log("Document successfully deleted!");
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    },
    editScorecardItem(itemId) {
      this.$router.push({ name: 'edit', params: { id: itemId } });
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    handleSearch() {
      this.currentPage = 1;
    }
  },
};
</script>

<style>
.table-container {
  padding-right: 50px; 
  padding-left: 50px;
  padding-top: 20px;
}

table {
  width: 100%;
  border: 1px solid black;
  margin-top: 20px;
}

th, td {
  border: 1px solid #000000;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 4px;
}

.pagination-search-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination {
  display: flex;
  align-items: center;
}

.pagination button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 5px; /* Curve the button */
  cursor: pointer;
}

.pagination button:hover {
  background-color:  #878787;
}

.search-container input {
  margin-left: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Edit and delete button container */
.action-buttons {
  display: flex;
  gap: 5px; /* Adjust the space between buttons */
}

/* Edit button */
button.edit {
  background-color: #d7a510; /* Yellow */
  color: #fff;
  border-radius: 5px;
}

/* Delete button */
button.delete {
  background-color: #dc3545; /* Red */
  color: #fff;
  border-radius: 5px;
}

.google-map-container {
  display: flex;
  align-items: flex-start; /* Align items at the top of the container */
}

.google_map1 {
  width: 45%;
  padding-top: 20px;
}

.add-job-button {
  margin-left: 10%; /* Adjust left margin to separate from the map */
  padding: 8px 16px;
  background-color: #00ff517b;
  color: #000000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none; /* Remove default link underline */
  margin-top: 20px;
}

.add-job-button:hover {
  background-color: #28df62; /* Darker blue on hover */
}


</style>

