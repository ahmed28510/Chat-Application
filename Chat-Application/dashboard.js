import { auth, db } from "./firebase.config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  ref,
  set,
  push,
  onValue,
  onChildAdded,
  onDisconnect,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

/* ---------- State ---------- */
let me = null;            // logged-in user (Firebase Auth)
let users = [];           // all other users (from the database)
let selectedId = null;    // user whose chat is open
let stopMessages = null;  // used to stop the previous chat listener

/* ---------- Elements ---------- */
const usersListEl = document.getElementById("usersList");
const chatUserName = document.getElementById("chatUserName");
const chatUserStatus = document.getElementById("chatUserStatus");
const messagesEl = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const msgInput = document.getElementById("msgInput");
const meNameEl = document.getElementById("meName");

/* ---------- Helpers ---------- */
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Same chat id for both users (sorted uids), so A_B and B_A are one room
function chatIdFor(otherId) {
  return [me.uid, otherId].sort().join("_");
}

function getSelected() {
  return users.find((u) => u.id === selectedId);
}

function statusHTML(online) {
  return `<span class="d-inline-block rounded-circle me-1 ${online ? "bg-success" : "bg-secondary"}" style="width:9px;height:9px"></span>${online ? "Online" : "Offline"}`;
}

/* ---------- Render: sidebar ---------- */
function renderUsers() {
  usersListEl.innerHTML = "";

  if (!users.length) {
    usersListEl.innerHTML = '<div class="text-muted small p-3">No other users yet</div>';
    return;
  }

  users.forEach((u) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className =
      "list-group-item list-group-item-action d-flex align-items-center gap-2 py-3" +
      (u.id === selectedId ? " bg-primary-subtle" : "");

    const avatar = document.createElement("div");
    avatar.className =
      "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold flex-shrink-0";
    avatar.style.cssText = "width:40px;height:40px";
    avatar.textContent = (u.name || "?")[0].toUpperCase();

    const info = document.createElement("div");
    info.className = "d-none d-md-block text-truncate";
    const name = document.createElement("div");
    name.className = "text-truncate";
    name.textContent = u.name;
    const st = document.createElement("div");
    st.className = "small text-muted";
    st.innerHTML = statusHTML(u.online);
    info.append(name, st);

    item.append(avatar, info);
    item.addEventListener("click", () => selectUser(u.id));
    usersListEl.appendChild(item);
  });
}

/* ---------- Render: chat header ---------- */
function renderHeader() {
  const u = getSelected();
  if (!u) return;
  chatUserName.textContent = u.name;
  chatUserStatus.className =
    "badge rounded-pill " +
    (u.online ? "bg-success-subtle text-success-emphasis" : "bg-secondary-subtle text-secondary-emphasis");
  chatUserStatus.textContent = u.online ? "Online" : "Offline";
}

/* ---------- Messages (realtime) ---------- */
function addMessage(m) {
  // remove the placeholder as soon as the first message arrives
  const ph = messagesEl.querySelector(".placeholder-text");
  if (ph) ph.remove();

  const mine = m.from === me.uid;

  const wrap = document.createElement("div");
  wrap.className = "d-flex flex-column " + (mine ? "align-self-end align-items-end" : "align-self-start align-items-start");
  wrap.style.maxWidth = "75%";

  const bubble = document.createElement("div");
  bubble.className =
    "px-3 py-2 rounded-4 text-break " +
    (mine ? "bg-primary text-white" : "bg-white border");
  bubble.textContent = m.text;

  const time = document.createElement("small");
  time.className = "text-muted mt-1";
  time.style.fontSize = "11px";
  time.textContent = m.ts ? formatTime(m.ts) : "";

  wrap.append(bubble, time);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function listenMessages(otherId) {
  if (stopMessages) stopMessages(); // stop the previous chat listener

  messagesEl.innerHTML = '<div class="text-muted small m-auto placeholder-text">No messages yet. Say hi 👋</div>';

  const messagesRef = ref(db, `chats/${chatIdFor(otherId)}/messages`);
  // Loads old messages and receives new ones instantly (both sides)
  stopMessages = onChildAdded(messagesRef, (snap) => addMessage(snap.val()));
}

/* ---------- Select user ---------- */
function selectUser(id) {
  selectedId = id;
  renderUsers();
  renderHeader();
  listenMessages(id);
  msgInput.focus();
}

/* ---------- Send message ---------- */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text || !selectedId) return;

  msgInput.value = "";
  try {
    await push(ref(db, `chats/${chatIdFor(selectedId)}/messages`), {
      from: me.uid,
      to: selectedId,
      text,
      ts: serverTimestamp(),
    });
  } catch (err) {
    console.error(err);
    alert("Message could not be sent: " + err.message);
    msgInput.value = text;
  }
});

/* ---------- Users list + online/offline (from the database) ---------- */
function watchUsers() {
  onValue(ref(db, "users"), (snap) => {
    const data = snap.val() || {};
    users = Object.entries(data)
      .filter(([id]) => id !== me.uid)
      .map(([id, u]) => ({ id, name: u.name || u.email, online: !!u.online }))
      .sort((a, b) => a.name.localeCompare(b.name));
    renderUsers();
    renderHeader();
  });
}

/* ---------- Presence: my online/offline status ---------- */
function setupPresence() {
  const myOnlineRef = ref(db, `users/${me.uid}/online`);
  const myLastSeenRef = ref(db, `users/${me.uid}/lastSeen`);

  onValue(ref(db, ".info/connected"), (snap) => {
    if (snap.val() !== true) return;
    // Tab closed / connection lost -> the server marks me offline
    onDisconnect(myOnlineRef).set(false);
    onDisconnect(myLastSeenRef).set(serverTimestamp());
    set(myOnlineRef, true);
  });
}

/* ---------- Auth guard ---------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html"; // not logged in -> back to login
    return;
  }
  me = user;
  meNameEl.textContent = user.displayName || user.email;
  watchUsers();
  setupPresence();
});

/* ---------- Logout ---------- */
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await set(ref(db, `users/${me.uid}/online`), false);
  } catch (e) {}
  await signOut(auth);
  location.href = "login.html";
});
