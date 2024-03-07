<template>
  <div>
    <h2>Review Edit Requests</h2>
    <div v-if="originalItem">
      <h3>Original Data</h3>
      <p>Place of Work: {{ originalItem.placeOfWork }}</p>
      <p>Latitude: {{ originalItem.latitude }}</p>
      <p>Longitude: {{ originalItem.longitude }}</p>
      <p>Serial Number: {{ originalItem.serialNumber }}</p>
      <p>RTSP Cameras:</p>
      <ul>
        <li v-for="(camera, index) in originalItem.rtspCameras" :key="index">{{ camera.value }}</li>
      </ul>
      <p>Responsible Person: {{ originalItem.responsiblePerson }}</p>
    </div>
    <div v-if="editedItem">
      <h3>Edited Data</h3>
      <p>Place of Work: {{ editedItem.placeOfWork }}</p>
      <p>Latitude: {{ editedItem.latitude }}</p>
      <p>Longitude: {{ editedItem.longitude }}</p>
      <p>Serial Number: {{ editedItem.serialNumber }}</p>
      <p>RTSP Cameras:</p>
      <ul>
        <li v-for="(camera, index) in editedItem.rtspCameras" :key="index">{{ camera.value }}</li>
      </ul>
      <p>Responsible Person: {{ editedItem.responsiblePerson }}</p>
    </div>
    <button @click="goBack">Back</button>
  </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/firebase';

export default {
  data() {
    return {
      originalItem: null,
      editedItem: null,
    };
  },
  async mounted() {
    const itemId = this.$route.params.id;
    await this.fetchOriginalItem(itemId);
    await this.fetchEditedItem(itemId);
  },
  methods: {
async fetchOriginalItem(itemId) {
  console.log('Item ID:', itemId); // Check if itemId is defined
  console.log('Firestore:', firestore); // Check if firestore is defined

  const scorecardDocRef = doc(firestore, 'your_collection', itemId);
  console.log('Doc Ref:', scorecardDocRef); // Check the document reference

  try {
    const docSnapshot = await getDoc(scorecardDocRef);
    console.log('Doc Snapshot:', docSnapshot); // Check the document snapshot

    if (docSnapshot.exists()) {
      this.originalItem = { ...docSnapshot.data() };
    } else {
      console.error('Document does not exist!');
    }
  } catch (error) {
    console.error('Error fetching document:', error);
  }
},
    async fetchEditedItem(itemId) {
      // Fetch edited item from wherever the edited data is stored
      // For example, you might have a separate collection or store for edit requests
      // Here, we assume edited data is stored in the same collection as the original data
      const scorecardDocRef = doc(firestore, 'your_edits_collection', itemId);
      try {
        const docSnapshot = await getDoc(scorecardDocRef);
        if (docSnapshot.exists()) {
          this.editedItem = { ...docSnapshot.data() };
        } else {
          console.error('Edited document does not exist!');
        }
      } catch (error) {
        console.error('Error fetching edited document:', error);
      }
    },
    goBack() {
      this.$router.go(-1); // Go back to the previous page
    },
  },
};
</script>

<style>
/* Add your styling here */
</style>
