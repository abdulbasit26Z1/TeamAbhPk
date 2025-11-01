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
---

File-backed persistence via GitHub Actions
---------------------------------------

If you'd like job postings to be committed into this repository under `db/jobs/`, this project includes a GitHub Actions workflow that can create job files when triggered by the GitHub API.

What was added:
- `.github/workflows/create_job.yml` — listens for `repository_dispatch` events with `event_type: create_job` and will create a JSON file under `db/jobs/` from the `client_payload.job` object and commit it to the `main` branch.

How to trigger the workflow (recommended secure ways)
1) From a secure server (recommended):
    - Create a GitHub Personal Access Token (PAT) with `repo` scope and keep it secret (do not embed it in client-side JS).
    - Your server makes a POST request to the repository dispatch API to trigger the workflow. Example using curl (server-side):

```bash
curl -X POST \
   -H "Accept: application/vnd.github+json" \
   -H "Authorization: token $GITHUB_PAT" \
   https://api.github.com/repos/<OWNER>/<REPO>/dispatches \
   -d '{"event_type":"create_job","client_payload":{"job":{"id":"12345","title":"Test job","category":"Design","description":"Job from demo"}}}'
```

2) From your machine using the `gh` CLI (manual testing):

```bash
gh api repos/<OWNER>/<REPO>/dispatches -f event_type=create_job -f client_payload='{"job":{"id":"12345","title":"Test job","category":"Design","description":"Job from demo"}}'
```

Security notes
- Do NOT place a PAT or repo write token in client-side JavaScript or the GitHub Pages site; it would be visible to anyone who opens the site.
- Use a server-side relay (small Express function, serverless function on Vercel/Render) that stores the PAT in environment variables and exposes a protected endpoint your site can call (for example using an `X-API-Key`). The relay then triggers the repository_dispatch request shown above.
- Alternatively, you can restrict writes by validating the request on the relay (origin checks, API key), and only allow trusted clients.

Next steps I can implement for you
- Add a small Express-based relay inside `server/` that accepts job posts from the frontend and triggers the repository dispatch (stores PAT in env vars). This avoids exposing the PAT to the browser.
- Or, if you prefer to manage a relay yourself, I can update `assets/js/marketplace.js` to POST to a configurable relay URL.

If you'd like me to implement the Actions-only approach now (I created the workflow file), tell me whether you want the serverless relay added as well and whether to implement the frontend integration to call it.

Actions-only option (what I added for convenience)
-----------------------------------------------
I added a small helper script and a client-side helper that make it easy to trigger the workflow from your local machine without hosting a server:

- `scripts/trigger_job.sh` — read a job JSON from stdin and call the repository_dispatch API using a locally-set `GITHUB_PAT` environment variable. Example:

```bash
echo '{"job":{"id":"12345","title":"Hello","category":"Design","description":"From CLI"}}' | GITHUB_PAT=ghp_... ./scripts/trigger_job.sh
```

- `assets/js/marketplace-actions.js` — when you submit the Post Job form in `marketplace/post-job.html` the page will generate a ready-to-copy `curl` or `gh` CLI command prefilled with the payload so you can run it locally (no token in the browser).

These additions let you operate entirely with Actions (no extra hosting) while keeping the PAT secret because you run the trigger from your local machine or CI.

