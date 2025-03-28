# Latex Editor

This project is set to become simple Electron (Chromium) - based LaTex editor as a desktop application. This setup does the following:

1. **Creates an Electron app** with a main process (`main.js`) that opens a browser window.  
2. **Loads an `index.html`** with embedded scripts to provide:
   - A large editor canvas that expands to fill available window space (fixing the “text disappears at half the window width” issue).
   - Basic LaTeX highlighting via CodeMirror's `stex` mode.
   - Rudimentary track-changes and comment features.
3. **Uses the Electron file dialogs** to open/save `.tex` and `.proj` files on the local filesystem.

Missing for production: polish the UI, handle concurrency, integrate LaTex compiler, add PDF preview.

---

# Project Structure

Example folder layout:

```
my-latex-editor/
  ├─ package.json
  ├─ main.js
  ├─ index.html
  └─ renderer.js
```

1. **`package.json`**: Basic Electron metadata and scripts.
2. **`main.js`**: Electron's “main process” entry point.
3. **`index.html`**: The user interface loaded by Electron in a Chromium window.
4. **`renderer.js`**: The front-end JavaScript, interacts with CodeMirror and the DOM.

Below are more detailed descriptions of each file.

---

## 1. `package.json` (Requirements)


Make sure to have installed Node.js + npm on your system. Then run inside the repository directory:

```bash
npm install
npm start
```

This will install Electron locally and then run the app.

---

## 2. `main.js`

This is the main app. Security notes:

- Setting `nodeIntegration: false` and `contextIsolation: true` is more secure.  
- File dialog exposure functions through IPC (`ipcMain`) so the renderer doesn't directly use `fs`.  

---

## 3. `index.html`

This is where the app is visualized (rendered) for users.

Note how `#editor` is set to **flex** with `.CodeMirror` set to fill the entire space. This controls the editor size, that is, that the editor is large and resizes with the window, preventing text from being cut off.

---

## 4. `renderer.js`

This script runs in the renderer process (the web page) and communicates with `main.js` via IPC to open/save files:

- **`ipcRenderer.invoke(...)`** calls the main process to show open/save dialogs, then returns the path or content.  
- We store the opened `.tex` content in `editor` and keep track of the file name.  
- We store **comments** and **changes** in `projectData`.  
- The style ensures that the editor always takes up the entire panel, so the text will **not** be clipped at half the window width.

---

# Running the App

1. **Install dependencies**: `npm install`.
2. **Start**: `npm start`.

Electron will open a **1200×800** window with the LaTeX editor app. The following should be visible:

- A menu bar with buttons: **New**, **Open .tex**, **Save .tex**, **Open Project**, **Save Project**, **Track Changes**, **Add Comment**, **Comment Selection**, **Compile**.
- A large CodeMirror editor filling most of the screen, and a comments sidebar on the right.

---

## Improvements to be implemented

1. **Local or Remote PDF Compilation**:  
   - Call a local `pdflatex`, then preview the PDF in another Electron `BrowserWindow` or embedded `<iframe>`.  

2. **Persisted Settings**:  
   - Store user preferences (theme, font size, etc.) across sessions, consider storing them in a small JSON or use something like [`electron-store`](https://github.com/sindresorhus/electron-store).  

3. **Advanced Track Changes**:  
   - Currently, we just log changes in the `projectData.changes` array. You could highlight them permanently (instead of clearing after 2 seconds), display a “diff view,” or allow “accept/reject changes.”  

4. **Security**:  
   - Electron apps have more power than a regular browser (access to file system, etc.). See [Electron security best practices](https://www.electronjs.org/docs/latest/tutorial/security) for production.  

5. **Styling**:  
   - Consider a different CodeMirror theme: switch the `theme` property in the constructor or add other styling adjustments to `.CodeMirror`.  

Using this Electron approach, you get a **desktop** user experience for your LaTeX editor, with file dialogs that read/write `.tex` and project `.proj` files on your local filesystem, while the UI is still built using **HTML/CSS/JS**.
