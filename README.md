# Apex Sales Analytics Dashboard

A responsive, single-page Sales Analytics Dashboard built with vanilla HTML, CSS, and JavaScript.

## Features

- **Executive KPI Cards**: Real-time tracking of Total Revenue, Completed Orders, Average Order Value (AOV), and Estimated Gross Profit with percentage comparison trends and custom canvas sparklines.
- **Interactive Canvas Charts**:
  - **Sales & Revenue Velocity**: Dual-axis line and gradient area chart with hover tooltips and crosshairs.
  - **Revenue by Category**: Donut chart with category slices, inner totals, and dynamic breakdown table.
  - **Sales by Acquisition Channel**: Comparative bar chart across sales channels.
- **Top Performing Products Leaderboard**: Ranked leaderboard tracking unit sales and revenue.
- **Transactions Management Table**: Searchable, filterable (by status, category, channel), sortable, and paginated transaction records.
- **Record / Edit Sale Modal**: Interactive modal with form validation to add or modify transactions.
- **CSV Data Export**: One-click export of filtered transaction data to CSV format.
- **Persistence via Web Storage**: All records persist locally via `localStorage` with sample data seeding and demo reset capabilities.
- **Zero CSS Variables**: Styled using explicit color codes and layout properties. Zero external dependencies.

## Getting Started

Simply open `index.html` in any modern web browser or serve via any static HTTP server.

```bash
# Optional: run with Python built-in static server
python -m http.server 8080
```

