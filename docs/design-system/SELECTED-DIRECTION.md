# DoRoboty Illustrated — application-wide direction

Ewa selected this direction on November 8, 2026, then explicitly extended it to **the entire application** on November 15. It applies to public pages, offer listing and detail, company pages, candidate application and account screens, employer administration, settings and the case workspace. The old 67-file Poster People kit remains an immutable historical reference. Product state, role boundaries, semantic markup, keyboard behavior and component reuse rules still apply.

## Visual roles

| Role                             | Selected value                                                        |
| -------------------------------- | --------------------------------------------------------------------- |
| Main and section headings        | Bundled Fraunces, weight 750, SOFT 100, WONK 1                        |
| Body, controls, role/card names  | Bundled DM Sans, 400–700                                              |
| Paper / surface / ink            | #F7F7EF / #FFFFFF / #232128                                           |
| Primary / deep / supporting fill | #6645E6 / #33215C / #EBE5FF                                           |
| Small orientation highlights     | #D9F66F                                                               |
| Main action                      | White label on purple; deep-purple hover                              |
| Cards / controls                 | Rounded 24px cards and 16–18px controls, thin outlines                |
| Illustration                     | Original people.svg from the selected landing, caption in its own row |

No dogs, pink primary actions or replacement serif. Preserve numerical Match Score colors as domain facts. Job titles remain DM Sans; reserve Fraunces for orientation and section headings. Preserve complete long names and salary basis/period. Do not invent salaries or employer logos.

## Composition and implementation

Home: candidate/employer choice → illustrated hero → candidate search, Polish category tiles, real store-backed job cards, process, employer entry and FAQ; employer path shows publication options, an honest informational dialog and a route to the existing editor. The candidate search and category criteria live in the hash route query and survive audience changes. Never embed the standalone page or copy its fixture store.

Listing and offer detail: persistent labels for search, Polish category name before Build/Apply/Lead, lavender fill plus purple outline and check for selection, compact filters, readable repeated facts, DM Sans job titles, salary and contract basis together, and a clear primary action. An unknown salary is explicitly shown as unknown. Mobile offers form one column with wrapping facts and tags.

Candidate application, profile, saved items and history: compact Fraunces page heading, grouped white form/reading surface, 16px or larger entry text, clear labels, purple primary action and local state feedback. Long names and answers grow naturally. Employer job editor, organization, candidate review, dashboard and settings share the same form, card, navigation, data and focus rules. People illustrations are reserved for orientation and helpful empty states, not repeated data rows.

Reuse JobCard, SalaryFact, Base UI Button/Dialog and existing hash routes. The primary publication action starts the existing local publishing flow; plans have no checkout, entitlement, price or expiry enforcement. Candidate answers are manually authored; there is no candidate AI assistant in this version.

Shared theme: `tokens.css`, existing marketplace aliases, `src/app/selected-theme.css` and `src/app/selected-app.css`. Home layout: `src/app/landing.css`. Navigation: `src/features/public/public-navigation.tsx` and the workspace shell. Assets and OFL licenses: `src/assets/selected/`. Do not introduce runtime links to a global skill or a sibling folder.

## Source and verification

Transferred from Ewa's November 8 local `2026-11-08-fresh-landing` prototype. The original illustration was authored for that prototype; font files carry their bundled SIL Open Font License texts. Source layout and illustration-caption correction are preserved; the app's data and domain flows replace demo-only interactions.

Check desktop, 390px and 320px across public, candidate and employer routes, actual font loading, long title, missing salary/logo, search/reset/history, keyboard navigation, empty/error states, candidate application and employer publishing. Run `npm run check`; preserve the kit's own integrity checks. Record actual outcomes and open issues in [the integration task](../tasks/selected-landing-integration.md). Historical Poster People pixel values no longer define acceptance for changed visual roles.
