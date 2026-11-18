# 💬 Chat Application

A real-time one-to-one chat application built with **HTML, JavaScript, Bootstrap 5** and **Firebase** (Authentication + Realtime Database). Users sign up, see everyone else who has registered, and chat privately with live message delivery and online/offline status.

## 🔗 Live Demo

**https://chat-application-b6115.web.app/**

## ✨ Features

- **Authentication** – Sign up and log in with email and password (Firebase Authentication)
- **Protected dashboard** – Visiting the dashboard without logging in redirects to the login page
- **Users list** – Every registered user appears in the sidebar, loaded from the database
- **Real-time private chat** – Messages are saved in the database and appear instantly on the other user's screen, with replies arriving live
- **Separate chat for every pair of users** – Each conversation is stored under its own chat ID
- **Online / Offline status** – Updates automatically when a user opens the app, closes the tab, loses connection, or logs out
- **Message timestamps** – Every message shows the time it was sent
- **Responsive UI** – Built with Bootstrap 5; the sidebar collapses to avatars on small screens
- **Friendly error messages** – Clear messages for wrong password, existing email, weak password, etc.

## 🛠️ Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | HTML5, JavaScript (ES Modules)          |
| Styling        | Bootstrap 5.3                           |
| Auth           | Firebase Authentication (Email/Password)|
| Database       | Firebase Realtime Database              |
| Hosting        | Firebase Hosting                        |

## 📁 Project Structure

```
Chat-Application/
├── index.html            # Landing page (Sign up)
├── signup.html           # Sign up page
├── login.html            # Login page
├── dashboard.html        # Chat dashboard
├── signup.js             # Creates the account and saves the user record
├── login.js              # Logs the user in
├── dashboard.js          # Users list, real-time chat, online status, logout
└── firebase.config.js    # Firebase initialization (auth + database)
```

## 🗄️ Database Structure

```
users
 └── {uid}
      ├── name
      ├── email
      ├── online          (true / false)
      ├── lastSeen
      └── createdAt

chats
 └── {uid1_uid2}          (the two user IDs, sorted)
      └── messages
           └── {messageId}
                ├── from  (sender uid)
                ├── to    (receiver uid)
                ├── text
                └── ts    (server timestamp)
```

## 🚀 Run Locally

1. Clone or download this project.
2. Open the folder in VS Code.
3. Start it with the **Live Server** extension (right-click `login.html` → *Open with Live Server*).

> The app uses ES Modules, so it must be served over `http://` (Live Server or any local server). Opening the files by double-clicking will not work.

## 🔥 Firebase Setup

To use your own Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a **Web app** and copy its config object.
3. Open `firebase.config.js` and replace the values in `firebaseConfig` (including `databaseURL`) with your own.
4. **Authentication** → Sign-in method → enable **Email/Password**.
5. **Realtime Database** → Create database, then open the **Rules** tab and publish:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && $chatId.contains(auth.uid)",
        "messages": {
          "$msgId": {
            ".write": "auth != null && $chatId.contains(auth.uid) && !data.exists()",
            ".validate": "newData.child('from').val() === auth.uid && newData.child('text').isString() && newData.child('text').val().length > 0 && newData.child('text').val().length <= 2000"
          }
        }
      }
    }
  }
}
```

These rules mean:
- Only logged-in users can see the users list
- A user can only edit their own profile and online status
- Only the two people in a chat can read it
- Messages can only be sent under your own user ID

## ☁️ Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting      # choose your project, set public directory to "Chat-Application"
firebase deploy --only hosting
```

In `firebase.json`, make sure the public directory points to the folder containing your HTML files:

```json
{
  "hosting": {
    "public": "Chat-Application",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

## 📖 How It Works

1. **Sign up** – `createUserWithEmailAndPassword` creates the account, the display name is set, and a record is written to `users/{uid}`.
2. **Log in** – `signInWithEmailAndPassword` authenticates the user and redirects to the dashboard.
3. **Dashboard guard** – `onAuthStateChanged` sends anyone who is not logged in back to the login page.
4. **Users list** – `onValue` listens to `users`, so new signups and status changes appear live.
5. **Chat** – Selecting a user opens the chat room `chats/{uid1_uid2}`. `onChildAdded` loads old messages and receives new ones instantly. Sending a message uses `push`.
6. **Presence** – `.info/connected` together with `onDisconnect` marks a user offline automatically when the tab closes or the connection drops.

## 🔮 Future Improvements

- Unread message counters
- Typing indicator
- Profile pictures
- Message delete / edit
- Group chats
- Password reset

## 👤 Author

**Ahmed Ghufran**

---

⭐ If you like this project, feel free to give it a star!
