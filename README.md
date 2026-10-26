# Help Desk Lite

A simple IT help desk app for logging and prioritizing support tickets. Users submit a ticket, the app decides its priority from impact and urgency, suggests first troubleshooting steps by category, and tracks each ticket from Open to Resolved.

Built in one evening as a work sample for an IT internship interview.

**Live demo:** (https://help-desk-lite-six.vercel.app)

## Features

- Ticket form with category, description, impact and urgency, with friendly inline validation
- Auto-priority (P1 to P4) based on impact x urgency, similar to ITIL priority matrices, with a live preview as you fill in the form
- Suggested first troubleshooting steps per category (Network, Hardware, Microsoft 365, Account/Login, Printer, Security)
- Ticket board with Open, In Progress and Resolved columns, sorted by priority then age
- Filter the board by priority, plus a stats strip for open, in progress, resolved and open P1 tickets
- Tickets saved in the browser with localStorage; sample tickets on first visit and a "Reset demo" link
- Responsive layout for desktop and mobile
- Accessible by default: real form controls under the custom tiles, visible focus states, and animations turned off for people who prefer reduced motion

## Priority matrix

| Impact \ Urgency | Low | Medium | High |
|---|---|---|---|
| Single user | P4 | P3 | P3 |
| Team | P3 | P2 | P2 |
| Whole office | P2 | P1 | P1 |

## Tech stack

- HTML, CSS and vanilla JavaScript (no frameworks)
- CSS custom properties as design tokens (colors, type, spacing)
- Deployed on Vercel

## Run locally

Open `index.html` in a browser, or use the VS Code Live Server extension.

## Design note

This is an unofficial design study inspired by The Back Room's visual identity (color palette and typography). It is not affiliated with or endorsed by The Back Room. No logos or brand assets are used.

## Author

Daniel Martin G. Canlapan
BS Computer Science, Angeles University Foundation
Portfolio: https://danielcanlapan.vercel.app
