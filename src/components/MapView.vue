<template>
  <div>
    <div ref="map" class="map-container"></div>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/firebase';

export default {
  data() {
    return {
      markers: [],
    };
  },
  async mounted() {
    await this.fetchMarkerData();
    this.initMap();
  },
  methods: {
    async fetchMarkerData() {
      const markerCollection = collection(firestore, 'your_collection');
      try {
        const querySnapshot = await getDocs(markerCollection);
        this.markers = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error fetching marker data:', error);
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

      // eslint-disable-next-line no-undef
      const map = new google.maps.Map(this.$refs.map, {
        center: { lat: 13.7, lng: 100.5 }, // Center the map around Thailand
        zoom: 5.5, // Set an appropriate zoom level
        restriction: {
          latLngBounds: thailandBounds,
          strictBounds: false,
        },
      });

      // Add markers to the map (same as before)
      this.markers.forEach((marker) => {
        const position = { lat: marker.latitude, lng: marker.longitude };
        // eslint-disable-next-line no-undef
        const googleMarker = new google.maps.Marker({
          position,
          map,
          title: marker.placeOfWork,
        });

        // Add click event listener to open URL on marker click (same as before)
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
  max-width: 100%; /* Limiting the width to the container's width */
  margin: 0 auto; /* Centering the map horizontally */
}
</style>
