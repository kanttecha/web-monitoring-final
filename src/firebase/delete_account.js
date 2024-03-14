// Require the firebase-admin module
const admin = require('firebase-admin');
// Load the service account key file, adjust the path as needed
const serviceAccount = require('./serviceAccountKey.json');

// User IDs to be deleted
const UIDs = ["TYYltMDA3obe2Ra1sEgflAPvpe82"]; // Add User IDs here

// Initialize the Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Store the original count of user IDs
const originalCount = UIDs.length;
// Set an interval to process 10 user IDs at a time (adjust interval as needed)
const intervalRef = setInterval(processNextTen, 1001);

// Function to process the next 10 user IDs
function processNextTen() {
  // Extract the next 10 user IDs from the array
  const uids = UIDs.splice(-10, 10);
  if (uids.length) {
    // Calculate the number of completed deletions
    const completed = originalCount - UIDs.length;
    // Log progress
    console.log(`[${completed}/${originalCount}] Deleting ${uids}`);
    // Delete each user ID
    uids.forEach(deleteUser);
  } else {
    // If no more user IDs to delete, perform cleanup
    cleanup();
  }
}

// Function to delete a user by their UID
function deleteUser(uid) {
  // Use the Firebase Admin SDK to delete the user
  admin.auth().deleteUser(uid)
    .catch(function (error) {
      // Log any errors that occur during deletion
      console.log("Error deleting user", uid, error);
    });
}

// Function to perform cleanup tasks
function cleanup() {
  // Clear the interval set for processing user IDs
  clearInterval(intervalRef);
  // Log that deletion process is finished
  console.log('finished');
  // Exit the process
  process.exit();
}
