# Vercel Deployment Notes

This project is meant to be deployed through Vercel’s GitHub integration, not GitHub Pages.

## Required environment variables

Set these in the Vercel project settings:

- `DATABASE_URL` — PostgreSQL connection string

## Recommended deploy flow

1. Push code to GitHub.
2. Import the repository into Vercel.
3. Add the production `DATABASE_URL`.
4. Deploy.
5. Verify login and application flows.

## Important

- GitHub Actions in this repo only validates the app.
- Do not use GitHub Pages for this project.
- SQLite is only suitable for local development.
