import { auth, db, authErrorText } from "./firebase.config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const form = document.getElementById("signupForm");
const errorEl = document.getElementById("error");
const btn = form.querySelector("button");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.classList.add("d-none");

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  if (!name) return;

  btn.disabled = true;
  btn.textContent = "Please wait...";

  try {
    // 1) Create the account in Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // 2) Save the user record (the dashboard users list is built from this)
    await set(ref(db, "users/" + cred.user.uid), {
      name,
      email,
      online: false,
      createdAt: serverTimestamp(),
    });

    location.href = "dashboard.html";
  } catch (err) {
    errorEl.textContent = authErrorText(err);
    errorEl.classList.remove("d-none");
    btn.disabled = false;
    btn.textContent = "Sign Up";
  }
});
