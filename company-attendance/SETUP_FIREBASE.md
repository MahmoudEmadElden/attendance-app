# How to Activate Online Database (Firebase)

Currently, the app is in **Demo Mode** (it only saves data on THIS device).
To make it work for the **Whole Company** (so you can see what employees accept on their phones), you need to connect it to **Google Firebase**.

It is free and takes about 3 minutes.

## Step 1: Create Project
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"**.
3.  Name it `company-attendance` and turn off Google Analytics (not needed).
4.  Click **"Create project"**.

## Step 2: Create Database
1.  On the left menu, click **Build** -> **Firestore Database**.
2.  Click **"Create database"**.
3.  Choose **"Start in test mode"** (easier for now) -> **Next** -> **Enable**.

## Step 3: Get Your Keys
1.  Click the ⚙️ **Gear Icon** (Project Settings) at the top left.
2.  Scroll down to "Your apps" and click the **</>** icon (Web).
3.  Type any name (e.g. "App") and click **Register app**.
4.  **COPY** the code block that looks like `const firebaseConfig = { ... };`.

## Step 4: Paste into Code
1.  Open the file `js/firebase-config.js` on your computer.
2.  Delete everything in it.
3.  **Paste** the code you copied.
4.  Add `export default firebaseConfig;` at the very end.

**Done!** Now when you "Add Employee" on your computer, it will appear on their phone instantly.
