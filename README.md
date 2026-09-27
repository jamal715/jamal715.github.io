# Jamal Nasir — portfolio

Public page: https://jamal715.github.io/
Editor: https://jamal715.github.io/edit/

Sign in with the existing research editor password. Edit, preview, then **Save & publish**. Text, photo framing and the original CV file are published through Supabase. No GitHub token is needed. The password remains in memory for this tab only; sign out clears it.

Photo controls: fill or contain, zoom, horizontal and vertical position. Replacing a photo resets framing. Browser drafts and pending files survive reloads. Export/import backups and reload published content are under Backup & restore. A revision check prevents an old tab overwriting newer published changes.

## Architecture

GitHub Pages hosts the interface. `content-store.js` reads the public singleton `portfolio_profile` in Supabase project `bkbzrrvjpogtrhlkixll`. Public credentials allow reading only. The `portfolio-admin` Edge Function checks the existing research password on every mutation, limits failed attempts, validates content, and stores immutable named files in `portfolio-assets`. Server credentials are never sent to the browser. Updating the existing research password also changes the portfolio editor password.

Function source and database migration are in `supabase/`. The frontend public key is intentionally public. Never put a service key, password or password hash in the repository.

`profile.json` and the prerendered HTML are an initial/offline fallback. Live edits are stored in Supabase; they do not create GitHub commits. To refresh the fallback, export the current profile from the editor as `profile.json`, then run `node build.cjs`.

Run `node --test tests/content-store.test.cjs tests/portfolio-admin.test.cjs` for publishing, authentication, upload and conflict checks.
