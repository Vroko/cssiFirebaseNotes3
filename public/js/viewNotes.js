let googleUserId;
window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users`).orderByChild(`text`).on('value', (snapshot) => {
    snapshot.forEach(function(child) {
            console.log(child.val()) // NOW THE CHILDREN PRINT IN ORDER
    });
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

let noteList = [];
const renderDataAsHtml = (data) => {
  let cards = ``;
   
  for(const noteId in data) {
    const note = data[noteId];
    noteList.push(note);
    
  };
  for(const n in noteList) {
      const note = noteList[n];
    // For each note create an HTML card
    cards += createCard(note, n)
  }

  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
   return `
     <div class="column is-one-quarter">
       <div class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div class="card-content">
           <div class="content">${note.text}</div>
         </div>
         <div class="footer">
            <footer class="card-footer">
                <a herf="#" class="card-footer-item" onclick="deleteNote('${noteId}')">Delete</a>
                <a herf="#" class="card-footer-item" onclick="editNote('${noteId}')">Edit</a>
            </footer>
         </div>
       </div>
     </div>
   `;
};

function deleteNote(noteId) {
    firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
}

function editNote(noteId) {
    const editNoteModal = document.querySelector("#editNoteModal");
    
    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
    notesRef.on('value', (snapshot) =>
    {
        const note = snapshot.val();
        document.querySelector("#editTitleInput").value = note.title;
        document.querySelector("#editTextInput").value = note.text;
        document.querySelector("#noteId").value = noteId;
    })
    editNoteModal.classList.toggle("is-active");
}

function saveEditedNote() {
    console.log("Save");
    const title = document.querySelector("#editTitleInput").value;
    const text = document.querySelector("#editTextInput").value;
    const noteId = document.querySelector("#noteId").value;
    const editedNote = {title, text};
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote);
    
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.toggle("is-active");
}

function closeEditModal(){
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.toggle("is-active");
}