# GridFlow 🚚
### Urban Logistics Optimization Engine

**Plan smarter deliveries. Optimize vehicle capacity. Adapt to changing conditions.**

GridFlow is a logistics optimization platform designed to help delivery operations plan vehicle assignments, organize multi-stop routes, and manage delivery constraints through a centralized system.

The goal is to bring order management, vehicle capacity planning, route optimization, and operational monitoring into one platform — reducing inefficient planning and making delivery operations more adaptable.

> 🚧 **Project Status:** Under active development. The backend and database connection are being set up first, followed by core logistics APIs, route planning, and the dashboard.

---

## 🎯 The Problem

Delivery operations often manage orders, vehicle capacity, delivery deadlines, and route planning separately. This can lead to inefficient vehicle utilization, unnecessary travel, missed delivery windows, and difficulty responding to unexpected disruptions.

GridFlow aims to address these challenges through a unified logistics planning system.

## 💡 What GridFlow Aims to Build

- **Order Management** — Create, view, update, and track delivery orders.
- **Vehicle Management** — Maintain vehicle details, capacities, and availability.
- **Capacity-Aware Assignment** — Assign eligible orders to vehicles while respecting capacity constraints.
- **Multi-Stop Route Planning** — Organize delivery stops to reduce unnecessary travel.
- **Delivery Time Windows** — Account for delivery deadlines and scheduling constraints.
- **Dynamic Replanning** — Recalculate plans when a vehicle becomes unavailable or an urgent order arrives.
- **Route Plan History** — Store and compare original and optimized plans.
- **Operations Dashboard** — Present useful information about orders, vehicles, and route plans.

Features will be implemented incrementally and validated as the project develops.

## 🏗️ Architecture

The intended architecture separates the user interface, API layer, database, and optimization logic.

```text
┌─────────────────────────────┐
│      React Frontend         │
│ Dashboard · Orders · Routes │
└──────────────┬──────────────┘
               │ HTTP / REST API
┌──────────────▼──────────────┐
│       Node.js + Express     │
│ API · Validation · Services │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│         PostgreSQL          │
│ Orders · Vehicles · Plans   │
└─────────────────────────────┘
```

The architecture may expand to include geospatial queries, background optimization jobs, and real-time updates as those capabilities are implemented.

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database driver | `pg` (node-postgres) |
| Configuration | dotenv |
| API middleware | CORS, Express JSON middleware |
| Version control | Git and Git