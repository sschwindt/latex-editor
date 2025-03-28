# Latex Editor

This project is set to become A simple JavaScript LaTex editor that runs in a webbrowser featuring the following:

1. **Syntax highlighting** (via [CodeMirror](https://codemirror.net/)).
2. **Basic menus** and toolbar items.
3. **Comment function** (inline comments and a comment sidebar).
4. **Track Changes** mode, with insertion/deletion annotations.
5. **Storage of comments and tracked changes** to a "project" file (JSON format) with the same base name as the `.tex` file.

> **Note:** This is a *minimal* working example meant to illustrate one possible approach. Production-ready solutions will require more robust handling of edge cases (e.g., concurrency, multiple users, partial file loads, continuous auto-saves, robust highlighting, PDF preview hooks, etc.).

---

## Folder Structure

```
my-latex-editor/
   ├── index.html
   ├── editor.js
   ├── project-sample.proj  (example project file for "myfile.tex")
   ├── project-sample/      (example latex project)
   ├── myfile.tex           (sample LaTeX file)
   └── codemirror/          (CodeMirror libraries and CSS)
```


---

## `index.html`

- Loads the CodeMirror library and the `editor.js` script.
- Creates the layout (toolbar, editor area, comment sidebar).
- Demonstrates how to tie it all together.

---

## `editor.js`

Handles:

1. **Editor Initialization**: Set up CodeMirror for LaTeX with basic options.
2. **Track Changes**: When enabled, we store changes in memory (and ultimately in the project file).
3. **Comment Function**: Adds a comment to the relevant text or simply an inline marker in the source. We also maintain a list of comments in the sidebar.
4. **Load/Save** of `.tex` and "project" data, which includes comment and tracked-change metadata.


---

## Further Steps

1. **CodeMirror Setup**:  
   - We include the `stex` mode for syntax highlighting LaTeX.  
   - You can further configure CodeMirror with a variety of plugins, auto-completion, snippet insertion, etc.

2. **Track Changes**:  
   - This demo simply logs insert/delete/replace operations. A real system might also highlight inserted text in the editor permanently, or maintain a "diff" overlay that is toggled on/off.

3. **Comments**:  
   - We store each comment in `projectData.comments`. Each comment can optionally include a range (the selected text’s position in the editor).  
   - We display them in a sidebar.  
   - In a more advanced version, you’d attach each comment to a portion of text more persistently, handle editing/deleting comments, etc.

4. **Project File**:  
   - In the snippet, we show how you can save `projectData` to a `.proj` file. This data includes:
     - `fileName` (the `.tex` file name it’s associated with),
     - `comments` array,
     - `changes` array (logged changes).
   - When you open a `.proj` file, you can restore the comments and (optionally) reapply highlights for track-changes.

5. **Export / Printing / Real-world Use**:  
   - For a real LaTeX workflow, you typically want a backend server or local tool to compile and preview the resulting PDF.  
   - You might want to integrate a local PDF viewer in another panel or open it in a new tab.  
   - Additional features: "Find in files", "Bibliography management" (spell check should work with Grammarly in the browser)

6. **Security Note**:  
   - Allowing file uploads and downloads from the browser is convenient but must be handled carefully if deployed online.  
   - For local usage or a desktop-like environment, a packaged Electron/Chromium approach might be more suitable.

