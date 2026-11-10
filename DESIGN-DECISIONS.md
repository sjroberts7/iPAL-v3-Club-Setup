# Design coverage and outstanding decisions

The supplied iPAL Admin Figma file is the source for the existing Create Club UI. The specification supplies behaviour where the Figma interactions are absent or incomplete. Review Club, success, validation and necessary selection states extend the existing cards, typography, colours, inputs and buttons.

## Rules deliberately left undefined

1. **Grouped capacity and overlapping age ranges.** The prototype detects intersecting times on shared operating dates, allows automatic or manual capacity grouping, and saves the selected groups. It stores per-session capacities, weekday/date overrides and age ranges. It does not invent arithmetic for combining groups or overlapping age ranges. This needs a product decision before a real booking engine is implemented.
2. **Discount stacking.** Multiple discounts, including multiple of the same type, can be configured. Priority, combination order and stacking are unspecified, so no stacking calculation is made.
3. **Non-individual booking types.** Figma shows seven booking-type choices, but only Individual Booking has the full downstream configuration designed. All choices can be selected and preserved using the common configuration. Contract, subscription, appointments, trips, lunches and block-booking-specific rules/screens remain undefined. They are not represented as fully specified booking engines.
4. **Cancellation period unit.** The supplied field says Cancellation Period without a confirmed unit or detailed cancellation policy. The number is stored and shown verbatim; hours/days and refund implications have not been invented.
5. **Pricing eligibility.** Weekly, monthly, members and within-days values are saved with the stated meanings. Edge cases such as partial weeks, several sessions in one monthly package, precedence between special rates and the scope of As a Whole require confirmation for a live checkout. This prototype configures prices and displays them; it does not calculate customer invoices.
6. **Late-fee application.** Trigger times are derived from the actual session start. Whether successive stages replace or accumulate previous charges is undefined. Copying currently previews and copies the first session's stages from the selected demo/source club into the selected target session; broader cross-session mapping requires a product rule.
7. **Payment schedules.** Dependent settings are respected in the UI and review. Due-date calculation, instalment schedules, rounding and provider-specific processing are outside this configuration prototype.
8. **Blank capacity.** Blank capacity fields are preserved and shown as Not set. The explicit unlimited switch is the only setting labelled Unlimited. No booking-limit default is inferred for blanks.
9. **Public prototype data.** Configuration is local to the visitor's browser. There is no shared club database, actual staff register or communication service. File-password settings demonstrate configuration and do not encrypt or send a register.

## Interaction reconciliation

- Some Figma prototype links are incomplete or misdirected (availability, fee-copy navigation and discount continuation). The implementation follows the written behaviour instead of reproducing broken links.
- Email advances to Review Club, as explicitly requested, although the older Figma frame has a Create Club footer action.
- Date changes remove session-specific dates and capacity overrides that are no longer valid. All Dates always resolves against the latest club dates. Deleting a session removes its nested capacity and fees. Changing names/prices or reordering does not unnecessarily invalidate a confirmed grouping.
- Values behind disabled settings are retained for restoration. Review marks dependent payment options disabled when their parent is off.
- Unrelated product areas in the Clubs sidebar are visual context, not separate implemented iPAL modules.

## Visual reference

Desktop source frames are 1440 × 1024. The implementation uses the inspected Plus Jakarta Sans font, cyan/green wizard states, pill-shaped 34 px inputs and 36 px buttons, 98 px progress strip, fixed 76 px footer and step-specific content widths. Source assets are bundled locally. Native date/time picker popovers remain browser-provided; the input shells use the iPAL styling.

The implemented layout was visually checked in the available desktop browser. An exhaustive pixel-difference comparison of every Figma variant at exactly 1440 × 1024 has not been performed. Cross-browser native picker appearance will vary.
