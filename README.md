# My Cloud Service

Premium cloud file storage front end built with vanilla HTML, CSS, and JavaScript, backed by Supabase Storage.

## Features

- Premium liquid glass UI with responsive desktop and mobile layouts
- Drag-and-drop uploads with queue previews and drag-to-reorder
- Real upload telemetry with progress, speed, and ETA
- Optional client-side image compression before upload
- Search, filter, sort, grid/list view, and bulk file actions
- File info and storage statistics modals
- Theme persistence, settings persistence, keyboard shortcuts, and export to CSV
- Lightweight PWA shell with a service worker and web manifest
- Connection status, offline-aware actions, retryable library loading, and visible upload limits
- Keyboard-accessible dropzone, clearable search, focus-trapped dialogs, and improved live status announcements
- Phone-sized header, safe-area-aware dialogs, and tap controls for upload queue ordering

## Files

- `index.html`: Main app shell and modal structure
- `styles.css`: Design system, responsive layout, glass morphism, and animations
- `script.js`: Supabase integration, uploads, previews, file management, and settings
- `supabase_setup.sql`: Bucket creation and public storage policies
- `supabase_policy_fix.sql`: Incremental policy repair script for existing Supabase setups
- `manifest.webmanifest`: PWA manifest
- `service-worker.js`: Offline shell caching
- `icon.svg`: App icon

## Setup

1. Create a Supabase project and a public storage bucket named `files`.
2. Run `supabase_setup.sql` in the Supabase SQL editor.
3. Confirm the Supabase URL and anon key in `script.js`.
4. Serve the folder over HTTP.

If your bucket already exists and delete still fails, run `supabase_policy_fix.sql` instead of rebuilding everything.

Example local server:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- The current SQL enables anonymous delete access because the brief requested anonymous uploads and management. Tighten that policy for production if needed.
- Upload progress uses the Supabase Storage REST endpoint directly so the UI can show real transfer telemetry in the browser.
- Image compression only applies to compressible images. Videos upload unchanged.
- The browser shell cache is versioned in `service-worker.js`; bump the cache name and asset query strings together when shipping future front-end changes.
