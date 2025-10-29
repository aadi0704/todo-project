document.addEventListener("DOMContentLoaded", function () {
    const addBtn = document.getElementById("addNoteButton");
    const notesContainer = document.getElementById("notesItemsContainer");
    const noteTitleInput = document.getElementById("noteTitleInput");
    const noteContentInput = document.getElementById("noteContentInput");
    const noteSearchInput = document.getElementById("noteSearchInput");

    localStorage.setItem("lastpage", "notes");


    let editIndex = null;

    let notesList = JSON.parse(localStorage.getItem("notes")) || [];

    function updateLocalStorage() {
        localStorage.setItem("notes", JSON.stringify(notesList));
    }
    noteSearchInput.addEventListener("input", function () {
        const searchTerm = noteSearchInput.value.toLowerCase();
        const filteredNotes = notesList.filter(note =>
            note.title.toLowerCase().includes(searchTerm)|| note.content.toLowerCase().includes(searchTerm)
        );
        renderNotes(filteredNotes);
    });


    function renderNotes(filteredNotes = null) {
        notesContainer.innerHTML = "";
        const notesToRender = filteredNotes || notesList;
        if (notesList.length === 0) {
            noteSearchInput.classList.add("d-none");
            const wrapper = document.createElement("div");
            wrapper.style.display = "flex";
            wrapper.style.flexDirection = "column";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.padding = "20px 0";

        

            const msg = document.createElement("p");
            msg.textContent = "No notes yet. Add some notes!";
            msg.classList.add("details");
            wrapper.appendChild(msg);

            notesContainer.appendChild(wrapper);
            return;
        }
        noteSearchInput.classList.remove("d-none");
        notesToRender.forEach(createAndAppendNote);
    }

    function onAddNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title || !content) {
            alert("Enter valid title and content!");
            return;
        }

        if (editIndex !== null) {
            notesList[editIndex].title = title;
            notesList[editIndex].content = content;
            editIndex = null;
            addBtn.textContent = "Add Note";
            showMotivationTip("update");
        } else {
            notesList.push({ id: Date.now(), title, content });
            showMotivationTip("add");
        }

        noteTitleInput.value = "";
        noteContentInput.value = "";
        updateLocalStorage();
        renderNotes();
    }

    function createAndAppendNote(note) {
        const noteElement = document.createElement("li");
        noteElement.classList.add("note-item-container","fade-out");

        const contentContainer = document.createElement("div");
        contentContainer.classList.add("note-content-container");
        noteElement.appendChild(contentContainer);

        const noteTitleEl = document.createElement("h5");
        noteTitleEl.classList.add("note-title");
        noteTitleEl.textContent = note.title;
        contentContainer.appendChild(noteTitleEl);

        const noteContentEl = document.createElement("p");
        noteContentEl.classList.add("note-content");

        const fullText = note.content;
        if (fullText.length > 150) {
            noteContentEl.textContent = fullText.slice(0, 150) + "...";

            const showMoreBtn = document.createElement("button");
            showMoreBtn.className = "btn btn-link btn-sm p-0 ms-1";
            showMoreBtn.textContent = "Show More";
            contentContainer.appendChild(noteContentEl);
            contentContainer.appendChild(showMoreBtn);

            let expanded = false;
            showMoreBtn.onclick = () => {
                expanded = !expanded;
                if (expanded) {
                    noteContentEl.textContent = fullText;
                    showMoreBtn.textContent = "Show Less";
                } else {
                    noteContentEl.textContent = fullText.slice(0, 150) + "...";
                    showMoreBtn.textContent = "Show More";
                }
            };
        } else {
            noteContentEl.textContent = fullText;
            contentContainer.appendChild(noteContentEl);
        }

        const iconsContainer = document.createElement("div");
        iconsContainer.classList.add("edit-delete-container");

        const editIcon = document.createElement("i");
        editIcon.classList.add("far", "fa-edit", "edit-icon");
        editIcon.style.paddingRight = "10px";
        editIcon.onclick = () => onEditNote(note.id);
        iconsContainer.appendChild(editIcon);

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");
        deleteIcon.addEventListener("click",()=>{
                    noteElement.classList.add("remove");
                    setTimeout(()=>onDeleteNote(note.id),500);
                });
        
        iconsContainer.appendChild(deleteIcon);

        noteElement.appendChild(iconsContainer);
        notesContainer.appendChild(noteElement);
    }

    function onEditNote(noteId) {
        const noteIndex = notesList.findIndex(n => n.id === noteId);
        if (noteIndex === -1) return;
        noteTitleInput.value = notesList[noteIndex].title;
        noteContentInput.value = notesList[noteIndex].content;
        addBtn.textContent = "Update Note";
        editIndex = noteIndex;
    }

    function onDeleteNote(noteId) {
        notesList = notesList.filter(n => n.id !== noteId);
        updateLocalStorage();
        renderNotes();
        showMotivationTip("delete");
    }

    addBtn.onclick = onAddNote;
    renderNotes();

    function updateFooterTime() {
        const now = new Date();
        document.getElementById("footerTime").textContent = ` | ${now.toLocaleTimeString()}`;
    }
    setInterval(updateFooterTime, 1000);
    updateFooterTime();
    const tips = [
  "Summarize key ideas in your own words — it boosts memory retention.",
  "Review your notes regularly, not just before exams.",
  "Use bullet points or headings to keep notes organized.",
  "Highlight only the most important points — less is more.",
  "Link new information to what you already know for deeper understanding.",
  "Write, don’t copy — active note-taking helps your brain engage.",
  "Keep notes clean and readable, future-you will thank you!",
  "Use color codes or symbols to group related concepts.",
  "After every study session, spend 5 minutes reviewing your notes.",
  "Turn your notes into quick flashcards for active recall practice."
];
function showRandomTip() {
  const randomIndex = Math.floor(Math.random() * tips.length);
  const tipElement = document.getElementById("dailyTip");
  tipElement.textContent = tips[randomIndex];
}
showRandomTip();
setInterval(showRandomTip, 30000);
function showMotivationTip(action) {
    const messages = {
        add: [
            "Great! Another note added — keep capturing ideas!",
            "Awesome! Documenting your knowledge is key!"
        ],
        update: [
            "Note updated — your notes are getting sharper!",
            "Keep refining your notes, it pays off!"
        ],
        delete: [
            "Note deleted — stay organized and focused!",
            "Clearing old notes keeps your mind fresh!"
        ]
    };

    const tipArray = messages[action] || ["Keep going!"];
    const message = tipArray[Math.floor(Math.random() * tipArray.length)];

    const popup = document.createElement("div");
    popup.className = "motivation-popup";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("hide");
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

});
