# Marketplace demo

This folder contains a lightweight, front-end-only marketplace demo. I created these files without modifying your existing site.

Files added:
- `index.html` — marketplace home (links to your main site)
- `listings.html` — job listings page (reads `data/jobs.json`)
- `post-job.html` — demo post-job form (client-side only)
- `dashboard.html` — simple user dashboard (demo data)
- `data/jobs.json` — sample job data used by the pages
- `../assets/css/marketplace.css` — marketplace-specific styles
- `../assets/js/marketplace.js` — minimal client-side behavior

How to view
1. Open `marketplace/index.html` in a browser (or `marketplace/listings.html`).
2. Because this is static, you can open files directly, or run a simple static server in the repo root, for example:

   python3 -m http.server 8000

Then visit http://localhost:8000/marketplace/index.html

Notes
- No backend or persistence was added. Posting a job shows a demo success message only.
- The pages reuse your existing vendor Bootstrap CSS/JS located under `assets/vendor`.

If you want, I can:
- Integrate a simple backend (Express/PHP) to persist jobs
- Add user auth mockups and per-user job listing
- Improve visuals to match the rest of your site
