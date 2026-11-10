# Verification record

## Automated checks

- TypeScript strict typecheck.
- Next.js production build.
- Model regression tests for date-bounded availability, overlapping times on shared dates, master-date reconciliation, session-owned capacity/fees, unlimited capacity, allowlists versus child blocklists, relative late-fee triggers, discount validation, register validation, persistence round-trips, grouping invalidation and membership/free pricing.

The latest run passed all 13 model tests, TypeScript and the Next.js production build. These tests run with `npm test` and do not need a browser or backend.

## Browser journey exercised

A club was created through all nine steps, Review Club and success, then opened in the saved-club view. The following were verified through the rendered interface:

- Required Setup validation, editable details and waiting-list conditional controls.
- Selecting an existing tile, creating a new tile with image upload and publication dates, and copying a demo club's dates.
- Creating a session with start/end times and all optional pricing settings.
- Reusing a session, editing its name, changing live status and inline prices.
- Reordering by pointer drag and the accessible keyboard alternative.
- Session deletion confirmation and removal.
- All-date, weekday and individual-date availability; invalid dates disabled.
- Reusing an extra, creating another extra and deleting it with confirmation.
- Actual overlapping sessions opening Group time slots and saving automatic grouping.
- All-days capacities, applicable weekday capacities, date overrides, age ranges, invalid-age validation and expandable session cards.
- Unlimited capacity disabling controls and restoring entered values when switched off.
- Payment toggles hiding dependent options, category and account selection.
- Location/year/class allowlists and an explicitly blocked child, correctly reflected in Review.
- Adding, duplicating and deleting a late-fee stage, independently configuring another session and previewing/copied stages. Relative trigger times were checked.
- Promo, sibling and amount-based discounts coexisting, including multiple promo codes; editable values and collapsed cards.
- Applying a booking email template, basic bold formatting, inserting an image and attaching a downloadable text file. Oversized upload validation was exercised.
- Register email addresses, fields and mismatched-password/invalid-address validation.
- Review summaries including prices, availability, capacities, restrictions, fees, discounts, attachments and email configuration.
- Refreshing on Review restored the current step and data; editing from Review returned with updated prices.
- Final Create Club validation, confirmation, saved club view and persistence after refresh.

## Visual checks and limits

The available desktop browser was used to inspect the wizard shell, session empty state and editor, capacity layout and success screen against the inspected Figma patterns. Reference renders for Setup, Sessions, Max Numbers, Discounts and Email were checked during visual QA. Progress-line alignment, descriptive text sizes and capacity spacing were corrected.

This is not an exhaustive screenshot regression suite. Every combination of conditional fields and every native picker on Chrome/Safari/Firefox have not all been independently exercised. No Vercel deployment or GitHub upload was performed in this environment. The production build is the deployment compatibility check; deployment instructions are in README.md.

No real payment or email service was used. Browser testing created fictitious local demonstration records only; none of that QA data is shipped as a saved browser state in the ZIP.
