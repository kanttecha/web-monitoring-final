const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Adjust the path

// User IDs to be deleted
const UIDs = ["TYYltMDA3obe2Ra1sEgflAPvpe82"]; // Add User IDs here

// initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// establish an interval to throttle requests
const originalCount = UIDs.length;
const intervalRef = setInterval(processNextTen, 1001); // Adjust interval as needed

function processNextTen() {
  const uids = UIDs.splice(-10, 10);
  if (uids.length) {
    const completed = originalCount - UIDs.length;
    console.log(`[${completed}/${originalCount}] Deleting ${uids}`);
    uids.forEach(deleteUser);
  } else {
    cleanup();
  }
}

function deleteUser(uid) {
  admin.auth().deleteUser(uid)
    .catch(function (error) {
      console.log("Error deleting user", uid, error);
    });
}

function cleanup() {
  clearInterval(intervalRef);
  console.log('finished');
  process.exit();
}
