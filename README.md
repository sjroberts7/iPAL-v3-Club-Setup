# iPAL Create Club prototype

A standalone desktop prototype built with Next.js App Router, React and TypeScript. It implements the nine configuration steps, Review Club, creation confirmation and a saved-club view. No login, database, API keys or Figma connection are needed to run it.

## Run locally

1. Extract `ipal-create-club.zip`.
2. Open a terminal in the extracted `ipal-create-club` folder (the folder containing `package.json`).
3. Install Node.js 20.9 or later; Node.js 22 LTS is suitable.
4. Run:

```bash
npm install
npm run dev
```

Open the localhost URL printed in the terminal, normally `http://localhost:3000`.

For a production build:

```bash
npm run build
npm start
```

Verification commands:

```bash
npm run typecheck
npm test
```

The dependency lockfile is included. Use `npm ci` for repeatable clean installs.

## Upload to GitHub

Create an empty repository on GitHub. Upload the **contents** of the extracted project folder, including `package.json`, `package-lock.json`, `app`, `components`, `lib`, `types`, `public`, `scripts` and configuration files. Do not upload the ZIP as the only repository file. Do not upload `node_modules` or `.next`.

Alternatively, from the project folder:

```bash
git init
git add .
git commit -m "Add iPAL Create Club prototype"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of your own empty repository.

## Deploy with Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the GitHub repository.
3. Select the **Next.js** framework preset.
4. Set the root directory to the folder containing `package.json`. Leave it at the repository root if you uploaded the project contents directly. If the repository contains an outer `ipal-create-club` folder, select that folder.
5. Use the normal build command, `npm run build`, and the framework's default output directory. No environment variables are required.
6. Deploy and open the deployment URL. Share that URL with stakeholders. Check the deployment's access settings if Vercel requires visitors to sign in.

No custom `vercel.json` is necessary. Vercel runs the deployed application; you do not need to keep your own local server running.

To update the prototype, edit the source, run the verification commands and production build, then commit and push the changes. Vercel rebuilds deployments from the connected branch. Existing visitors retain their browser-local demonstration data unless they reset it.

## Demonstrating the journey

- Choose **Create Club**, then create or select a booking tile.
- Select **Individual Booking** to follow the fully designed Create Club journey.
- Configure Setup, Dates, Sessions, Max Numbers, Payments, Restrictions, Fees, Discounts and Email.
- The demo clubs provide reusable dates, sessions, extras and late-fee examples.
- Review Club shows the current settings. Each Edit action returns to its step without discarding data.
- **Create Club** validates all steps and saves the club. **View Club** opens the saved configuration; **Create another club** starts a new draft.
- The gear on the Clubs page opens demonstration settings, including whether membership pricing is available.
- **Reset demonstration** on the Clubs, saved-club and success screens clears the draft and locally created clubs after confirmation.

The data is stored under `ipal-create-club-v1` in the current browser's localStorage. Refreshing preserves the draft, current step and created clubs. Each stakeholder has their own data; this is not a shared backend. Clearing site data, using a different browser or changing the deployment domain starts a separate demonstration.

Uploads are embedded in localStorage and limited to 1.5 MB per file. Browser storage also has a total quota. A visible message appears if saving fails; remove large uploads before refreshing. Use demonstration images, attachments and register details. Email and payment settings are configuration only: the app never sends emails, registers or payments.

## Source organisation

- `app/`: App Router entry point, global Figma-derived CSS and self-hosted font import.
- `components/Prototype.tsx`: application shell, Clubs page, wizard, review navigation and completion.
- `components/SetupDates.tsx`, `Sessions.tsx`, `Capacity.tsx`, `Configuration.tsx`, `Email.tsx`, `Review.tsx`, `Tiles.tsx`: feature views.
- `components/ui/`: styled inputs, switches, modal focus handling and calendars.
- `lib/model.ts`: defaults, date reconciliation, availability, overlap grouping and validation.
- `lib/store.tsx`: central state and persistence.
- `lib/demo-data.ts`: editable demonstration records and templates.
- `types/`: shared domain types.
- `public/assets/`: local exports from the supplied Figma design.
- `tests/model.test.ts`: model and validation regression tests.

Run `npm run format` to format source files. Figma assets and typography are local at runtime; there are no expiring Figma asset URLs in the application.

See `DESIGN-DECISIONS.md` for unresolved product rules and `QA.md` for the checks actually performed. This project is a prototype; it does not implement a customer checkout, a payment engine, live booking inventory or email delivery.
