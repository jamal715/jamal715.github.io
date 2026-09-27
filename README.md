# Jamal Nasir — portfolio

Live website: https://jamal715.github.io/

## Make changes without editing HTML

Open **https://jamal715.github.io/edit/**.

1. Edit your text, experience, projects and links. Add, remove or reorder entries; use Undo to restore an edit.
2. Expand the photo/CV panel to select files. Use Zoom, Horizontal position, Vertical position, and Fit to frame your portrait. New photos start at 1× zoom.
3. Select Preview changes and check desktop/mobile layouts.
4. Expand Connect GitHub to publish. Create a fine-grained token for **only jamal715.github.io**, with **Contents: Read and write**, and an expiry date. Enter it in the editor, never in chat. It is kept only in the current page's memory, sent only to api.github.com, and cleared on reload/disconnect.
5. Select **Publish to website**. This uploads the text, photo framing, original photo/CV bytes, and static page snapshot in one commit. Wait for **Live** before expecting the public page to match. GitHub Pages deployment normally takes a short time.

Publication checks for newer profile edits and refuses to overwrite them. New asset filenames are content-based to avoid stale browser caches. Drafts are kept locally on failure. A browser draft is never shown to public visitors as if it were published.

Import/export and manual GitHub upload remain available as a backup. Text and selected file drafts survive reloads in the same browser; clearing browser data removes them. Only a GitHub account with write access can publish.

## Replace the downloadable CV

The download uses the exact originally supplied PDF, without rewriting or reformatting it.

In the editor, expand **Replace your photo or downloadable CV**. Choose a PDF and download its renamed copy, `Jamal-Nasir-CV.pdf`. Use **Upload files to assets**, upload it and commit. The website's CV links keep working because the filename stays the same. This process preserves the PDF bytes.

## Replace your photo

Use the same panel to choose a JPG or PNG, preview it, and download its renamed copy. Selected files are validated and limited to 20 MB. Upload it into `assets` and commit. JPG uses `assets/profile.jpg`. For PNG, also download/upload `profile.json`, since the photo path changes to `assets/profile.png`.

The current photo comes from the existing repository. The display crop is controlled by `.portrait img` in `styles.css`.

## Files

- `profile.json`: all personal text, roles, project details and links.
- `styles.css`: design, spacing and responsive layout.
- `renderer.js`: shared rendering of profile content.
- `app.js`: loads the latest profile data.
- `index.html`: page shell and static fallback.
- `edit/`: browser-based editing and preview tools. No tokens or passwords are stored.
- `assets/Jamal-Nasir-CV.pdf`: replaceable CV.
- `assets/profile.jpg`: replaceable portrait.
- `build.cjs`: optional `node build.cjs` command to refresh the static HTML fallback after content edits. Normal live edits to `profile.json` do not require a build.

The previous fund page and QuantOra directory are retained at their existing paths, but the fund is no longer linked or mentioned in the profile.

## Preview locally

Run `python -m http.server 8000` and open http://localhost:8000.
