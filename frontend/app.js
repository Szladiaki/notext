let token = localStorage.getItem("token") || "";
let notes = [];
let currentUser = localStorage.getItem("user") || "";
let isLogin = true;
let editingNoteId = null;

const API_BASE = "";

document.addEventListener("DOMContentLoaded", () => {
  if (token && currentUser) {
    showUserInterface();
    loadNotes();
  }

  const pic = localStorage.getItem("profilePic");
  if (pic) document.getElementById("profile-pic").src = pic;
});

function openModal(login = true) {
  isLogin = login;
  document.getElementById("modal-title").textContent = login
    ? "Bejelentkezés"
    : "Regisztráció";
  document.getElementById("modal-username").value = "";
  document.getElementById("modal-password").value = "";
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

async function submitModal() {
  const user = document.getElementById("modal-username").value.trim();
  const pass = document.getElementById("modal-password").value.trim();
  if (!user || !pass) return alert("❗ Kérlek tölts ki minden mezőt!");

  const endpoint = isLogin ? "login" : "register";
  const res = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  });

  if (res.ok) {
    if (isLogin) {
      const data = await res.json();
      token = data.token;
      currentUser = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", currentUser);
      showUserInterface();
      loadNotes();
      closeModal();
      alert("✅ Sikeres bejelentkezés!");
    } else {
      alert("✅ Sikeres regisztráció! Most jelentkezz be.");
      closeModal();
    }
  } else {
    const err = await res.text();
    alert("❌ Hiba: " + err);
  }
}

function logout() {
  token = "";
  currentUser = "";
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("profilePic");
  location.reload();
}

function showUserInterface() {
  document.getElementById("user-display").textContent = currentUser;
  document.getElementById("user-display").classList.remove("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
  document.getElementById("profile-section").classList.remove("hidden");
  document.getElementById("login-btn").classList.add("hidden");
  document.getElementById("register-btn").classList.add("hidden");
}

function uploadProfilePic(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  fetch(`${API_BASE}/api/users/profile-pic`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.profilePic) {
        const fullUrl = API_BASE + data.profilePic;
        document.getElementById("profile-pic").src = fullUrl;
        localStorage.setItem("profilePic", fullUrl);
      }
    })
    .catch(err => {
      console.error("❌ Feltöltési hiba:", err);
    });
}

async function loadNotes() {
  const res = await fetch(`${API_BASE}/api/notes`, {
    headers: { Authorization: "Bearer " + token }
  });
  if (!res.ok) return alert("❌ Jegyzetek betöltése sikertelen!");
  notes = await res.json();
  displayNotes(notes);
}

function displayNotes(list, highlightId = null) {
  const container = document.getElementById("notes");
  container.innerHTML = "";
  for (const n of list) {
    const card = document.createElement("div");
    card.className =
      "p-4 bg-white rounded shadow flex flex-col justify-between transition-all duration-700 overflow-hidden break-words";
    if (n._id === highlightId) {
      card.classList.add("ring-2", "ring-purple-400", "scale-[1.02]");
      setTimeout(() => {
        card.classList.remove("ring-2", "ring-purple-400", "scale-[1.02]");
      }, 1500);
    }
    card.innerHTML = `
      <div>
        <h3 class="font-bold text-lg break-words">${n.title}</h3>
        <div class="prose break-words">${marked.parse(n.content)}</div>
      </div>
      <div class="mt-2 flex gap-2 justify-end">
        <button onclick="openEditModal('${n._id}')" class="text-blue-600 hover:underline">✏️</button>
        <button onclick="deleteNote('${n._id}')" class="text-red-600 hover:underline">🗑️</button>
        <button onclick="shareNote('${n._id}')" class="text-green-600 hover:underline">🔗</button>
      </div>
    `;
    container.appendChild(card);
  }
}

function openNoteModal() {
  document.getElementById("noteModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("note-title-input").focus(), 100);
}

function closeNoteModal() {
  document.getElementById("noteModal").classList.add("hidden");
  document.getElementById("note-title-input").value = "";
  document.getElementById("note-content-input").value = "";
}

async function submitNote() {
  const title = document.getElementById("note-title-input").value.trim();
  const content = document.getElementById("note-content-input").value.trim();
  if (!title || !content) return alert("❗ Cím és tartalom kötelező!");

  const res = await fetch(`${API_BASE}/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ title, content })
  });

  if (res.ok) {
    const newNote = await res.json();
    closeNoteModal();
    notes.unshift(newNote);
    displayNotes(notes, newNote._id);
  } else {
    alert("❌ Jegyzet mentése sikertelen!");
  }
}

function openEditModal(id) {
  const note = notes.find(n => n._id === id);
  if (!note) return alert("❌ Jegyzet nem található!");
  editingNoteId = id;
  document.getElementById("edit-title-input").value = note.title;
  document.getElementById("edit-content-input").value = note.content;
  document.getElementById("editModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("edit-title-input").focus(), 100);
}

function closeEditModal() {
  document.getElementById("editModal").classList.add("hidden");
  document.getElementById("edit-title-input").value = "";
  document.getElementById("edit-content-input").value = "";
  editingNoteId = null;
}

async function submitEdit() {
  const title = document.getElementById("edit-title-input").value.trim();
  const content = document.getElementById("edit-content-input").value.trim();
  if (!title || !content) return alert("❗ Minden mező kötelező!");
  await fetch(`${API_BASE}/api/notes/${editingNoteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ title, content })
  });
  closeEditModal();
  loadNotes();
}

async function deleteNote(id) {
  if (!confirm("Biztosan törlöd?")) return;
  await fetch(`${API_BASE}/api/notes/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token }
  });
  loadNotes();
}

function searchNotes(term) {
  const f = notes.filter(n =>
    n.title.toLowerCase().includes(term.toLowerCase()) ||
    n.content.toLowerCase().includes(term.toLowerCase())
  );
  displayNotes(f);
}

async function shareNote(id) {
  try {
    const res = await fetch(`${API_BASE}/api/notes/${id}/share`, {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    const url = `${window.location.origin}/share.html?id=${data.shareId}`;
    window.open(url, '_blank'); // Új ablakban nyitja meg a megosztott jegyzetet
  } catch (e) {
    alert("❌ Hiba történt a megosztás során.");
  }
}
