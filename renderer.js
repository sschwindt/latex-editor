/* global CodeMirror */

const { ipcRenderer } = require("electron");

let editor;
let trackChangesEnabled = false;

// Our in-memory project data
let projectData = {
  fileName: "untitled.tex",
  comments: [],
  changes: []
};

window.addEventListener("DOMContentLoaded", () => {
  // Initialize CodeMirror
  editor = CodeMirror(document.getElementById("editor"), {
    mode: "stex",
    lineNumbers: true,
    theme: "eclipse",
    value: "% Start typing your LaTeX here...\n"
  });

  // Track changes if enabled
  editor.on("change", (instance, changeObj) => {
    if (trackChangesEnabled) {
      recordChange(changeObj);
    }
  });

  // Initialize the resizer
  const editorContainer = document.getElementById("editorContainer");
  const resizer = document.getElementById("resizer");
  let isResizing = false;

  function onMouseDown(e) {
    isResizing = true;
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
  function onMouseMove(e) {
    if (!isResizing) return;
    const containerRect = editorContainer.getBoundingClientRect();
    const minWidth = 200;
    const maxWidth = containerRect.width - 150; // keep 150px for comments
    let newWidth = e.clientX - containerRect.left;
    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    document.getElementById("editor").style.width = newWidth + "px";
    // If needed, refresh CodeMirror: editor.refresh();
  }
  function onMouseUp(e) {
    isResizing = false;
    document.body.style.userSelect = "auto";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
  resizer.addEventListener("mousedown", onMouseDown);
});

/*******************************************************
 *  Button Actions
 *******************************************************/

window.newFile = function newFile() {
  if (!confirm("Create a new file? Unsaved changes will be lost.")) return;
  editor.setValue("");
  projectData = {
    fileName: "untitled.tex",
    comments: [],
    changes: []
  };
  updateTrackChangesButton(false);
};

window.openTexFile = async function openTexFile() {
  const result = await ipcRenderer.invoke("dialog:openFile", [
    { name: "TeX", extensions: ["tex"] }
  ]);
  if (result) {
    editor.setValue(result.content);
    projectData.fileName = extractFileName(result.filePath);
    projectData.comments = [];
    projectData.changes = [];
    refreshCommentsList();
  }
};

window.saveTexFile = async function saveTexFile() {
  const content = editor.getValue();
  const savePath = await ipcRenderer.invoke("dialog:saveFile", {
    defaultPath: projectData.fileName,
    data: content
  });
  if (savePath) {
    projectData.fileName = extractFileName(savePath);
    alert("File saved: " + savePath);
  }
};

window.openProjectFile = async function openProjectFile() {
  const result = await ipcRenderer.invoke("dialog:openFile", [
    { name: "Project", extensions: ["proj"] }
  ]);
  if (result) {
    try {
      projectData = JSON.parse(result.content);
      alert("Project loaded: " + result.filePath);
      refreshCommentsList();
    } catch (err) {
      alert("Error parsing project file.");
    }
  }
};

window.saveProjectFile = async function saveProjectFile() {
  const baseName = projectData.fileName.replace(/\.tex$/, "");
  const projectJson = JSON.stringify(projectData, null, 2);
  const savePath = await ipcRenderer.invoke("dialog:saveFile", {
    defaultPath: baseName + ".proj",
    data: projectJson
  });
  if (savePath) {
    alert("Project saved: " + savePath);
  }
};

/*******************************************************
 * Track Changes
 *******************************************************/
window.toggleTrackChanges = function toggleTrackChanges() {
  trackChangesEnabled = !trackChangesEnabled;
  updateTrackChangesButton(trackChangesEnabled);
};

function updateTrackChangesButton(isOn) {
  const btn = document.querySelector('#menuBar button[onclick="toggleTrackChanges()"]');
  btn.textContent = `Track Changes: ${isOn ? "On" : "Off"}`;
}

function recordChange(changeObj) {
  const inserted = changeObj.text.join("\n");
  const removed = changeObj.removed.join("\n");
  if (inserted && !removed) {
    // Insert
    projectData.changes.push({
      type: "inserted",
      text: inserted,
      from: changeObj.from,
      to: changeObj.to
    });
    highlightChange(changeObj.from, changeObj.to, "highlight-inserted");
  } else if (!inserted && removed) {
    // Delete
    projectData.changes.push({
      type: "deleted",
      text: removed,
      from: changeObj.from,
      to: changeObj.to
    });
    highlightChange(changeObj.from, changeObj.from, "highlight-deleted");
  } else {
    // Replacement
    projectData.changes.push({
      type: "replacement",
      oldText: removed,
      newText: inserted,
      from: changeObj.from,
      to: changeObj.to
    });
    highlightChange(changeObj.from, changeObj.to, "highlight-inserted");
  }
}

// Brief highlight to show insertion/deletion
function highlightChange(from, to, cssClass) {
  const marker = editor.markText(from, to, { className: cssClass });
  setTimeout(() => marker.clear(), 2000);
}

/*******************************************************
 *  Single "Add Comment"
 *******************************************************/
window.addComment = function addComment() {
  const text = prompt("Enter your comment:");
  if (!text) return; // user clicked Cancel or empty string
  const newComment = {
    id: Date.now(),
    text,
    date: new Date().toISOString()
  };
  projectData.comments.push(newComment);
  refreshCommentsList();
};

/*******************************************************
 *  Comments Pane
 *******************************************************/
function refreshCommentsList() {
  const listDiv = document.getElementById("commentsList");
  listDiv.innerHTML = "";
  projectData.comments.forEach((c) => {
    const div = document.createElement("div");
    div.className = "commentItem";
    div.textContent = `[${new Date(c.date).toLocaleString()}] ${c.text}`;
    listDiv.appendChild(div);
  });
}

/*******************************************************
 *  "Compile" Stub
 *******************************************************/
window.compileTex = function compileTex() {
  alert("LaTeX compilation triggered (Stub).");
};

/*******************************************************
 *  Helper
 *******************************************************/
function extractFileName(fullPath) {
  return fullPath.split(/[/\\]/).pop() || "untitled.tex";
}

