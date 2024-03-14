<template>
  <div>
    <!-- Container for the Google Map, referenced by ref="map" -->
    <div ref="map" class="map-container"></div>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { firestore } from '@/firebase'; // Import Firebase instance

export default {
  data() {
    return {
      markers: [], // Array to store marker data
    };
  },
  async mounted() {
    await this.fetchMarkerData(); // Fetch marker data from Firestore
    this.initMap(); // Initialize the Google Map
  },
  methods: {
    async fetchMarkerData() {
      // Fetch marker data from Firestore collection named 'job_collection'
      const markerCollection = collection(firestore, 'job_collection');
      try {
        const querySnapshot = await getDocs(markerCollection);
        // Map Firestore document data to an array of markers
        this.markers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching marker data:', error); // Log error if fetching data fails
      }
    },
    initMap() {
      // Define the bounds for Thailand
      const thailandBounds = {
        north: 20.463167,
        south: 5.61,
        east: 105.639808,
        west: 97.343777,
      };

      // Initialize Google Map
      // eslint-disable-next-line no-undef
      const map = new google.maps.Map(this.$refs.map, {
        center: { lat: 13.7, lng: 100.5 }, // Center the map around Thailand
        zoom: 5.5, // Set an appropriate zoom level
        restriction: {
          latLngBounds: thailandBounds, // Restrict map view to Thailand bounds
          strictBounds: false,
        },
      });

      // Add markers to the map based on marker data
      this.markers.forEach((marker) => {
        const position = { lat: marker.latitude, lng: marker.longitude };
        // eslint-disable-next-line no-undef
        const googleMarker = new google.maps.Marker({
          position,
          map,
          title: marker.placeOfWork,
        });

        // Add click event listener to open URL on marker click
        googleMarker.addListener('click', () => {
          window.open(marker.url, '_blank'); // Open URL in a new tab
        });
      });
    },
  },
};
</script>

<style scoped>
.map-container {
  height: 600px; 
  max-width: 100%; 
  margin: 0 auto;
}
</style>
