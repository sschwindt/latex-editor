/*******************************************************
 *  Global variables
 *******************************************************/
let editor;
let trackChangesEnabled = false;

// This object will store project metadata (comments, changes, etc.)
let projectData = {
  fileName: "myfile.tex",
  comments: [],
  changes: []
};

/*******************************************************
 *  Editor Initialization
 *******************************************************/
window.addEventListener("load", () => {
  editor = CodeMirror(document.getElementById("editor"), {
    mode: "stex",
    lineNumbers: true,
    theme: "eclipse",
    value: "% Start typing your LaTeX here...\n",
    extraKeys: {
      "Ctrl-S": saveFile,
      "Ctrl-O": openFile
    }
  });

  // Listen to content changes in the editor
  editor.on("change", (instance, changeObj) => {
    if (trackChangesEnabled) {
      recordChange(changeObj);
    }
  });
});

/*******************************************************
 *  Menu/Toolbar Actions
 *******************************************************/

// Create a new .tex file (clears the editor and project data)
function newFile() {
  if (!confirm("Are you sure you want to create a new file? Unsaved changes will be lost.")) return;
  editor.setValue("");
  projectData = {
    fileName: "untitled.tex",
    comments: [],
    changes: []
  };
  updateTrackChangesButton(false);
}

// Open an existing .tex file from user’s file system
function openFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".tex";

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.setValue(reader.result);
      projectData.fileName = file.name.replace(/\.tex$/, "") + ".tex";
      // Reset changes & comments for now
      projectData.comments = [];
      projectData.changes = [];
      refreshCommentsList();
    };
    reader.readAsText(file);
  });

  input.click();
}

// Save the current .tex file
function saveFile() {
  const textToSave = editor.getValue();
  const blob = new Blob([textToSave], { type: "text/plain" });
  const link = document.createElement("a");
  link.download = projectData.fileName || "myfile.tex";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  alert("File saved as " + link.download);
}

// Open a project file (.proj) that has the same name as the .tex file
function openProject() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".proj";

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        projectData = JSON.parse(reader.result);
        // For demonstration, we simply apply any changes or show comments.
        refreshCommentsList();
        alert("Project loaded: " + file.name);
      } catch (err) {
        alert("Error parsing project file.");
      }
    };
    reader.readAsText(file);
  });

  input.click();
}

// Save the project data (comments, changes) to a .proj file
function saveProject() {
  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  // Make sure to use the same base name as the .tex file
  const baseName = projectData.fileName.replace(/\.tex$/, "");
  link.download = baseName + ".proj";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  alert("Project saved as " + link.download);
}

/*******************************************************
 *  Track Changes
 *******************************************************/
function toggleTrackChanges() {
  trackChangesEnabled = !trackChangesEnabled;
  updateTrackChangesButton(trackChangesEnabled);
}

function updateTrackChangesButton(state) {
  const btn = document.querySelector('#menuBar button[onclick="toggleTrackChanges()"]');
  btn.textContent = `Track Changes: ${state ? "On" : "Off"}`;
}

function recordChange(changeObj) {
  // Simple approach: track insert or delete changes
  let text = changeObj.text.join("\n");
  let removed = changeObj.removed.join("\n");
  if (text && !removed) {
    // Inserted text
    projectData.changes.push({
      type: "inserted",
      text: text,
      from: changeObj.from,
      to: changeObj.to
    });
    highlightChange(changeObj.from, changeObj.to, "highlight-inserted");
  } else if (!text && removed) {
    // Deleted text
    projectData.changes.push({
      type: "deleted",
      text: removed,
      from: changeObj.from,
      to: changeObj.to
    });
    // Typically, you’d store the location before it was removed,
    // and highlight that region. For simplicity, we highlight
    // the from/to region (which is now gone).
    highlightChange(changeObj.from, changeObj.from, "highlight-deleted");
  } else {
    // Replacements or more complex changes can be broken into an insert + delete
    projectData.changes.push({
      type: "replacement",
      oldText: removed,
      newText: text,
      from: changeObj.from,
      to: changeObj.to
    });
    highlightChange(changeObj.from, changeObj.to, "highlight-inserted");
  }
}

// Basic function to add a temporary highlight in the editor
function highlightChange(from, to, cssClass) {
  // For demonstration, we add a small marker that fades out
  const marker = editor.markText(from, to, { className: cssClass });
  setTimeout(() => {
    marker.clear();
  }, 2000);
}

/*******************************************************
 *  Comments
 *******************************************************/

function addComment() {
  const text = prompt("Enter your comment:");
  if (!text) return;

  // For demonstration, we store a comment associated with the entire doc
  const newComment = {
    id: Date.now(),
    text,
    date: new Date().toISOString(),
    range: null
  };
  projectData.comments.push(newComment);
  refreshCommentsList();
}

function commentSelection() {
  const selection = editor.getSelection();
  if (!selection) {
    alert("No selection made.");
    return;
  }
  const text = prompt("Enter comment for selected text:");
  if (!text) return;

  const from = editor.getCursor("from");
  const to = editor.getCursor("to");

  // Save comment to projectData
  const newComment = {
    id: Date.now(),
    text,
    date: new Date().toISOString(),
    range: { from, to }
  };
  projectData.comments.push(newComment);

  // Add an inline marker so user sees that this text has a comment
  const marker = editor.markText(from, to, { className: "highlight-inserted" });
  // Store marker ID or similar, so you can later clear or update
  newComment.marker = marker;

  refreshCommentsList();
}

// Refresh the list of comments in the sidebar
function refreshCommentsList() {
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";
  projectData.comments.forEach((comment) => {
    const div = document.createElement("div");
    div.className = "commentItem";
    div.textContent = `[${new Date(comment.date).toLocaleString()}] ${comment.text}`;
    commentsList.appendChild(div);
  });
}

/*******************************************************
 *  "Compile" Stub
 *******************************************************/

function compileTex() {
  alert("LaTeX compilation triggered. (Stub) This would call a backend or local LaTeX engine.");
}

