import { auth, authErrorText } from "./firebase.config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorEl = document.getElementById("error");
const btn = form.querySelector("button");

// Already logged in -> go straight to the dashboard
onAuthStateChanged(auth, (user) => {
  if (user) location.href = "dashboard.html";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.classList.add("d-none");
  btn.disabled = true;
  btn.textContent = "Please wait...";

  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("email").value.trim(),
      document.getElementById("password").value
    );
    location.href = "dashboard.html";
  } catch (err) {
    errorEl.textContent = authErrorText(err);
    errorEl.classList.remove("d-none");
    btn.disabled = false;
    btn.textContent = "Login";
  }
});
