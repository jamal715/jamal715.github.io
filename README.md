# Jamal Nasir — portfolio

Live website: https://jamal715.github.io/

## Make changes without editing HTML

Open **https://jamal715.github.io/edit/**.

1. Edit text, experience, projects and links in the form. Add, remove or reorder entries as needed. Undo restores the last edit in the current session.
2. Select **Preview changes**. Choose Desktop or Mobile to inspect the layout. The preview updates as you edit.
3. Select **Download profile.json**.
4. Select **Upload to GitHub**, upload the downloaded `profile.json`, and commit to `main`.

Changes become live after GitHub Pages publishes. You can import a downloaded profile.json to resume editing. Text and selected file drafts survive a reload in the same browser; clearing browser data removes them. The editor saves drafts in your browser; it cannot publish by itself. Only a GitHub account with repository access can commit changes. Visitors cannot edit your live profile through the editor.

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
