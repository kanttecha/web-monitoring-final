<template>
  <div style="padding-top:20px">
    <!-- Buttons for generating .bat files, running all .bat files, and deleting files -->
    <div class="button-container">
      <button class="button" @click="performMainStreamOperation">Main Stream</button>
      <button class="button" @click="performSubStreamOperation">Sub Stream</button>
      
      <button @click="deleteFiles" class="button" style="background-color: #dc3545; color: white;">Delete Files</button>
    </div>

    <!-- Loop through the videos and render each one -->
    <div class="video-container">
      <div v-for="(video, index) in filteredVideos" :key="index" class="video-wrapper">
        <div>
          <!-- Video element with dynamically generated ID and ref -->
          <video
            :id="'video-' + index"
            :ref="`videoPlayer_${index}`"
            class="video-js vjs-default-skin"
            controls
            autoplay
            preload="auto"
            width="470"
            height="265"
          ></video>
        </div>
        
        <!-- Buttons for capturing and recording -->
        <div class="button-container">
          <button class="button" @click="toggleRecord(index)">{{ recording[index] ? 'Stop Recording' : 'Start Recording' }}</button>
          <button class="button" @click="capture(index)">Capture</button>
        </div>
      </div>
    </div>
    <div class="variable-info">
      <label class="info-label" for="placeOfWork">Job Name:</label>
      <p v-if="placeOfWork" class="info-value">{{ placeOfWork }}</p>

      <label class="info-label" for="serialNumber">Job Serial Number:</label>
      <p v-if="serialNumber" class="info-value">{{ serialNumber }}</p>

      <label class="info-label" for="jobType">Job Type:</label>
      <p v-if="jobType" class="info-value">{{ jobType }}</p>

      <label class="info-label" for="province">Job Province:</label>
      <p v-if="province" class="info-value">{{ province }}</p>

      <label class="info-label" for="district">Job District:</label>
      <p v-if="district" class="info-value">{{ district }}</p>

      <label class="info-label" for="subDistrict">Job Sub District:</label>
      <p v-if="subDistrict" class="info-value">{{ subDistrict }}</p>

      <label class="info-label" for="responsiblePerson">Responsible Person Data:</label>
      <p v-if="responsiblePerson" class="info-value">{{ responsiblePerson }}</p>
    </div>
    
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/firebase";
import axios from 'axios';
import config from '@/config_ip_port_server.js';
export default {
  data() {
    return {
      videos: [],
      recording: [],
      mediaRecorders: [],
      recordedChunks: [],
      serialNumber: null,
      placeOfWork: null,
      province: null,
      district: null,
      subDistrict: null,
      responsiblePerson: null,
      jobType: null,
      currentStream: 'sub',
      ipv4: config.ipv4,
      port: config.port,
    };
  },
  async mounted() {
    // Extract serial number from the route params
    this.serialNumber = this.$route.params.serialNumber;
    // Load variable information associated with the serial number
    await this.loadVariableInfo();
    // Load videos associated with the serial number
    await this.loadVideos();
    // Initialize video players
    this.initPlayers();
  },
  watch: {
    currentStream() {
      this.updateVideoSource();
    }
  },
  computed: {
    // Filter videos based on the current serial number
    filteredVideos() {
      return this.videos.filter(video => video.includes(this.serialNumber));
    }
  },
  methods: {
    async loadVideos() {
      try {
        const scorecardCollection = collection(firestore, "your_collection");
        const querySnapshot = await getDocs(scorecardCollection);

        querySnapshot.forEach((doc) => {
          const scorecardData = doc.data();
          const { serialNumber, rtspCameras } = scorecardData;

          rtspCameras.forEach((rtspCamera, cameraIndex) => {
            const outputFile = `${serialNumber}_${cameraIndex + 1}`;
            this.videos.push(outputFile);
            this.recording.push(false);
            this.mediaRecorders.push(null);
            this.recordedChunks.push([]);
          });
        });
      } catch (error) {
        alert("Error loading videos: " + error.message);
        console.error("Error loading videos:", error);
      }
    },
    initPlayers() {
      this.filteredVideos.forEach((videoId, index) => {
        const player = videojs(`video-${index}`, {}, () => {});
        player.src({
          src: `http://${this.ipv4}:${this.port}/hls/${videoId}_${this.currentStream}.m3u8`,
          type: 'application/x-mpegURL'
        });
      });
    },
    async toggleRecord(index) {
      try {
        if (!this.recording[index]) {
          // Start recording
          const video = this.$refs[`videoPlayer_${index}`][0];
          const stream = video.captureStream();
          const mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorders[index] = mediaRecorder;

          mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              this.recordedChunks[index].push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const blob = new Blob(this.recordedChunks[index], { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `video_${index}.webm`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Cleanup
            this.recording[index] = false;
            this.mediaRecorders[index] = null;
            this.recordedChunks[index] = [];
          };

          mediaRecorder.start();
          this.recording[index] = true;
        } else {
          // Stop recording
          this.mediaRecorders[index].stop();
        }
      } catch (error) {
        alert("Error recording: " + error.message);
        console.error("Error recording:", error);
      }
    },
    capture(index) {
      try {
        const canvas = document.createElement('canvas');
        const video = this.$refs[`videoPlayer_${index}`][0];
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `image_${index}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        alert("Error capturing: " + error.message);
        console.error("Error capturing:", error);
      }
    },
    async generateBatFiles() {
      try {
        console.log("Generating .bat files...");

        const scorecardCollection = collection(firestore, "your_collection");
        const querySnapshot = await getDocs(scorecardCollection);

        const data = [];

        querySnapshot.forEach((doc) => {
          const scorecardData = doc.data();
          console.log("Fetched scorecard data:", scorecardData);

          // Get the serialNumber and rtspCameras from the current scorecard data
          const { serialNumber, rtspCameras } = scorecardData;

          // Adjust rtspCamera values if necessary
          const adjustedRtspCameras = rtspCameras.map(rtspCamera => {
            // Check if the rtspCamera value ends with "&subtype=1" or "&subtype=0"
            if (!rtspCamera.value.endsWith("&subtype=1") && !rtspCamera.value.endsWith("&subtype=0")) {
              // If it doesn't end with "&subtype=1" or "&subtype=0", remove anything after 'channel=1' and add "&subtype=1" to the end
              const channelIndex = rtspCamera.value.indexOf("channel=1");
              if (channelIndex !== -1) {
                rtspCamera.value = rtspCamera.value.substring(0, channelIndex + 9) + "&subtype=1";
              }
            }
            return rtspCamera;
          });

          // Add adjusted data to the array
          data.push({ serialNumber, rtspCameras: adjustedRtspCameras });
          console.log("rtsppppppppppppp  ",rtspCameras)
        });

        // Make a POST request to the server to trigger the generation of .bat files
        const response = await axios.post(`http://${this.ipv4}:${this.port}/generateBatFiles`, { data });

        if (response.status === 200) {
          console.log("Bat files generated successfully.");
        } else {
          alert("Failed to generate .bat files.");
          console.error("Failed to generate .bat files.");
        }
      } catch (error) {
        alert("Error generating .bat files: " + error.message);
        console.error("Error generating .bat files:", error);
      }
    },
    async deleteFiles() {
      try {
        console.log("Deleting files...");
        await axios.delete(`http://${this.ipv4}:${this.port}/deleteFiles`);
        console.log("Files deleted successfully.");
      } catch (error) {
        alert("Error deleting files: " + error.message);
        console.error("Error deleting files:", error);
      }
    },
    async runAllBatFiles() {
      try {
        const response = await axios.get(`http://${this.ipv4}:${this.port}/runAllBatFiles`);
        console.log(response.data); // Log the response from the server
        // Optionally, you can show a success message or perform other actions after running all .bat files
      } catch (error) {
        alert("Error running .bat files: " + error.message);
        console.error('Error running .bat files:', error);
        // Optionally, you can show an error message or perform other actions if running the .bat files fails
      }
    },
    async performSubStreamOperation() {
      this.currentStream = 'sub'; // Update the current stream to sub
      await this.generateBatFiles();
      await this.runAllBatFiles();
      this.updateVideoSource();
    },
    async performMainStreamOperation() {
      this.currentStream = 'main'; // Update the current stream to main
      await this.generateBatFiles();
      await this.runAllBatFiles();
      this.updateVideoSource();
    },
    updateVideoSource() {
      this.filteredVideos.forEach((videoId, index) => {
        const player = videojs(`video-${index}`);
        player.src({
          src: `http://${this.ipv4}:${this.port}/hls/${videoId}_${this.currentStream}.m3u8`,
          type: 'application/x-mpegURL'
        });
        player.load(); // Load the new source
        player.play(); // Start playing the video automatically after loading the new source
      });
    },
    async loadVariableInfo() {
      try {
        const scorecardCollection = collection(firestore, "your_collection");
        const querySnapshot = await getDocs(scorecardCollection);

        querySnapshot.forEach((doc) => {
          const scorecardData = doc.data();
          // Check if the serial number matches
          if (scorecardData.serialNumber === this.serialNumber) {
            // Assign variable information
            this.placeOfWork = scorecardData.placeOfWork;
            this.province = scorecardData.province;
            this.district = scorecardData.district;
            this.subDistrict = scorecardData.subDistrict;
            this.responsiblePerson = scorecardData.responsiblePerson;
            this.jobType = scorecardData.jobType;
          }
        });
      } catch (error) {
        alert("Error loading variable information: " + error.message);
        console.error("Error loading variable information:", error);
      }
    },
  },
  beforeUnmount() {
    // Clean up resources here if needed
  },
};
</script>

<style scoped>
.video-wrapper {
  margin-bottom: 20px;
}
.button-container {
  margin-bottom: 10px;
}
.video-container {
  display: flex;
  flex-wrap: wrap;
}
.video-wrapper {
  flex-basis: calc(33.33% - 20px); /* Adjust based on the number of videos per row */
  margin-right: 20px;
}
.button {
  margin-right: 10px;
  border-radius: 5px;
  padding: 5px 10px;
}

.variable-info {
  margin-top: 20px;
  padding-left: 20px;
  text-align: left;
}



.info-label {
  font-weight: bold;
  text-align: left;
  font-size: 16px; /* Increase font size */
  width: 200px; /* Increase width for labels */
  padding-top: 10px;
  
}



.info-value {
  width: 20%;
  padding: 10px; /* Increase padding for better appearance */
  border: 1px solid #ccc; /* Add a border */
  border-radius: 5px; /* Add rounded corners */
  transition: border-color 0.3s ease; /* Smooth transition for border color */
  margin: 0;
  
  font-size: 16px; /* Increase font size */
  text-align: left;

}
</style>
