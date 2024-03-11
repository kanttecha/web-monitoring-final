const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const admin = require('firebase-admin');
const serviceAccount = require('./src/firebase/serviceAccountKey.json'); // Adjust the path

const app = express();
const PORT = 3000;

// Firebase Admin initialization
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Serve HLS files from the 'hls' directory
app.use('/hls', express.static(path.join(__dirname, 'hls')));






// Define a route for generating .bat files
app.post('/generateBatFiles', async (req, res) => {
  try {
    const { data } = req.body;

    data.forEach((item) => {
      const { serialNumber, rtspCameras } = item;
      console.log("rtspvalue= xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",rtspCameras)
      rtspCameras.forEach((rtspCamera, cameraIndex) => {
        const outputFile = `${serialNumber}_${cameraIndex + 1}`; // Output file name without extension
        let mainFfmpegCommand = '';
        let subFfmpegCommand = '';

        // Remove only the last character from rtspCamera.value
        let mainRtspCameraValue = rtspCamera.value.slice(0, -1);

        // Main stream configuration
        mainFfmpegCommand = `ffmpeg -v verbose -rtsp_transport tcp -i "${mainRtspCameraValue}0" -vf scale=2560:1440 -vcodec libx264 -r 25 -b:v 2000000 -crf 23 -acodec aac -sc_threshold 0 -f hls -hls_time 5 -segment_time 5 -hls_list_size 5 -hls_flags delete_segments "${outputFile}_main.m3u8"`;

        // Sub stream configuration
        subFfmpegCommand = `ffmpeg -v verbose -rtsp_transport tcp -i "${mainRtspCameraValue}1" -vf scale=704:576 -vcodec libx264 -r 25 -b:v 500000 -crf 25 -acodec aac -sc_threshold 0 -f hls -hls_time 5 -segment_time 5 -hls_list_size 5 -hls_flags delete_segments "${outputFile}_sub.m3u8"`;

        // Write the main stream command to a .bat file
        const mainBatFilePath = path.join(__dirname, 'hls', outputFile + '_main.bat');
        fs.writeFileSync(mainBatFilePath, mainFfmpegCommand);
        fs.chmodSync(mainBatFilePath, '755'); // Ensure .bat file has execute permission

        // Write the sub stream command to a .bat file
        const subBatFilePath = path.join(__dirname, 'hls', outputFile + '_sub.bat');
        fs.writeFileSync(subBatFilePath, subFfmpegCommand);
        fs.chmodSync(subBatFilePath, '755'); // Ensure .bat file has execute permission
      });
    });

    res.status(200).send('Bat files generated successfully.');
  } catch (error) {
    console.error("Error generating .bat files:", error);
    res.status(500).send('An error occurred during generation of .bat files.');
  }
});










// Define a route for deleting .bat, .ts, and .m3u8 files
app.delete('/deleteFiles', async (req, res) => {
  try {
    // Kill the ffmpeg.exe process
    exec('taskkill /F /IM ffmpeg.exe', (error, stdout) => {
      // Delete .bat, .ts, and .m3u8 files
      fs.readdirSync(path.join(__dirname, 'hls')).forEach(file => {
        if (file.endsWith('.bat') || file.endsWith('.ts') || file.endsWith('.m3u8')) {
          fs.unlinkSync(path.join(__dirname, 'hls', file));
        }
      });
      if (error) {
        console.error('Error killing ffmpeg.exe process:', error);
        res.status(500).send('An error occurred while killing ffmpeg.exe process.');
        return;
      }
      console.log('ffmpeg.exe process killed successfully:', stdout);
      res.status(200).send('Files deleted successfully.');
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).send('An error occurred during deletion of files.');
  }
});

// Define a route for running all .bat files
app.get('/runAllBatFiles', async (req, res) => {
  try {
    const batFilesDir = path.join(__dirname, 'hls');

    // Read all files in the hls directory
    fs.readdir(batFilesDir, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        res.status(500).send('Error reading directory');
        return;
      }

      // Filter .bat files
      const batFiles = files.filter(file => file.endsWith('.bat'));

      // Run all .bat files simultaneously
      runAllBatFiles(batFiles, res, batFilesDir);
    });
  } catch (error) {
    console.error("Error running .bat files:", error);
    res.status(500).send('An error occurred during execution of .bat files.');
  }
});

// Define a route for deleting users using Firebase Admin SDK
app.delete('/deleteUsers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete the user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    res.status(200).send(`User with ID ${userId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send('An error occurred during deletion of the user.');
  }
});

// Function to run all .bat files simultaneously
function runAllBatFiles(batFiles, res, batFilesDir) {
  const promises = batFiles.map(file => {
    const batFilePath = path.join(batFilesDir, file);
    const batFileDir = path.dirname(batFilePath);
    return new Promise((resolve, reject) => {
      exec(`${batFilePath}`, { cwd: batFileDir }, (error) => {
        if (error) {
          console.error(`Error running ${file}:`, error);
          reject(error);
        } else {
          console.log(`Successfully executed ${file}`);
          resolve();
        }
      });
    });
  });

  Promise.all(promises)
    .then(() => {
      console.log('All .bat files executed successfully');
      res.status(200).send('All .bat files executed successfully');
    })
    .catch((error) => {
      console.error('Error running .bat files:', error);
      res.status(500).send('An error occurred during execution of .bat files.');
    });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
