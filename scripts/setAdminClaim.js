const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load service account
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
  console.log('SUCCESS: Service account loaded successfully');
} catch (error) {
  console.error('ERROR: serviceAccountKey.json not found!');
  console.log('Please download it from Firebase Console and place it in your project root.');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('SUCCESS: Firebase Admin initialized successfully');
} catch (error) {
  console.error('ERROR: Firebase Admin initialization failed:', error);
  process.exit(1);
}

// Ask for admin email
rl.question('Enter the admin email address: ', async (adminEmail) => {
  if (!adminEmail || !adminEmail.includes('@')) {
    console.error('ERROR: Please enter a valid email address');
    rl.close();
    process.exit(1);
  }

  try {
    console.log(`Looking up user: ${adminEmail}...`);
    
    // Get user by email
    const user = await admin.auth().getUserByEmail(adminEmail);
    console.log(`SUCCESS: Found user: ${user.email} (UID: ${user.uid})`);
    
    // Check if admin claim already exists
    if (user.customClaims && user.customClaims.admin === true) {
      console.log('WARNING: User already has admin claim!');
      const answer = await askQuestion('Do you want to reset it? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Exiting...');
        rl.close();
        process.exit(0);
      }
    }
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log('SUCCESS: Admin claim set successfully!');
    
    // Verify it worked
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('User claims:', updatedUser.customClaims);
    
    console.log('\nSetup complete! You can now log in with:');
    console.log(`   Email: ${adminEmail}`);
    console.log('   Password: [the password you set in Firebase Console]');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`ERROR: User not found with email: ${adminEmail}`);
      console.log('\nMake sure you:');
      console.log('1. Created the user in Firebase Console (Authentication > Users)');
      console.log('2. Used the exact same email address');
    } else {
      console.error('ERROR:', error.message);
    }
  } finally {
    rl.close();
  }
});

// Helper function to ask questions
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}