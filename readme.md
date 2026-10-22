# GridFlow 🚚
### Smarter Dispatch. Better Routes. Faster Recovery.

**A constraint-aware logistics planning and delivery simulation platform for urban fleets.**

GridFlow helps small delivery operations answer three important questions:

1. **Can we deliver all our orders with the vehicles available?**
2. **What is a practical route and vehicle assignment plan?**
3. **What should change when a delivery plan is disrupted?**

Instead of focusing only on finding the shortest route, GridFlow combines vehicle capacity, delivery priorities, time constraints, and route planning to produce actionable dispatch plans.

Its central idea is simple:

> **A good delivery plan isn't just about the shortest route. It's about knowing what's feasible, understanding trade-offs, and adapting when conditions change.**

**Project status:** 🚧 Under active development. Backend infrastructure and PostgreSQL integration are the first milestones. Planning algorithms, simulation features, and the dashboard will follow incrementally.

---

## 🎯 The Problem

Small and medium-sized delivery operations often depend on spreadsheets, manual vehicle assignments, and separate navigation applications.

This creates several challenges:

- Vehicles may be underutilized while others are overloaded.
- Deliveries may be assigned without considering capacity or deadlines.
- Inefficient stop sequences increase travel distance.
- Urgent deliveries can disrupt existing routes.
- Vehicle breakdowns force dispatchers to rebuild plans manually.
- Dispatchers may not know why some orders remain unassigned.

Many routing tools focus on navigation. GridFlow focuses on the **decisions that happen before and during dispatch**.

---
How our algorithm works
Code mein hum har pending order ke liye:
1. Orders ko deadline ke ascending order mein sort karte hain — earliest deadline wala order pehle.
2. Available vehicles mein se sirf woh vehicles consider karte hain jinki remaining capacity order ke weight se zyada ya equal hai.
3. Un suitable vehicles mein se jis vehicle ki remaining capacity sabse kam hai, usko choose karte hain jo order ko accommodate kar sake.
4. Vehicle ki remaining capacity update karte hain. Agar koi vehicle fit nahi hota, toh order unassigned list mein chala jata hai.
Example
Suppose we have these vehicles:
Vehicle	Capacity
V1	100 kg
V2	60 kg
V3	30 kg

Orders deadline ke order mein process hote hain:
Order	Weight	Assigned vehicle	Reason
O1	25 kg	V3	Smallest suitable capacity
O2	50 kg	V2	V3 has only 5 kg left
O3	80 kg	V1	Only V1 can fit it

This reduces wasted vehicle capacity compared with always assigning the largest vehicle.
Important distinction
- Order prioritization: Earliest Deadline First (EDF) ordering.
- Vehicle selection: Best-Fit greedy strategy.
- Overall approach: A heuri
## 💡 What Makes GridFlow Different?

### 1. Constraint-First Planning

GridFlow checks whether orders can be assigned before attempting to optimize routes.

The planning engine considers:

- Vehicle carrying capacity
- Order size or load requirement
- Vehicle availability
- Delivery priority
- Delivery time windows (planned enhancement)

Orders that cannot be assigned remain visible with an explanation rather than silently disappearing from the plan.

**Example:** `Order #104 cannot be assigned: insufficient remaining vehicle capacity.`

### 2. Explainable Dispatch Decisions

GridFlow aims to make optimization understandable.

Instead of simply producing a route, it can explain decisions such as:

- Why a particular vehicle received an order
- How much available capacity remains
- Which orders could not be scheduled
- Whether a high-priority delivery affected the route

This makes the platform useful for both operational planning and understanding the algorithms behind it.

### 3. Disruption Lab — What-If Simulation

The standout feature of GridFlow is a controlled disruption simulator.

Dispatchers will be able to test scenarios such as:

- A delivery vehicle becomes unavailable.
- A high-priority order arrives after planning.
- A vehicle's usable capacity is reduced.

GridFlow generates a revised plan and compares it with the original.

The first implementation will use **manual scenario simulation**, not live vehicle tracking.

### 4. Plan Comparison

GridFlow retains earlier plans so users can compare planning decisions using measurable indicators.

| Metric | What it reveals |
|---|---|
| Estimated distance | Expected total route distance |
| Assigned orders | Number of deliveries scheduled |
| Unassigned orders | Deliveries requiring attention |
| Capacity utilization | How efficiently vehicles are loaded |
| Estimated late deliveries | Possible time-window violations |
| Vehicles used | Number of active vehicles required |

Metrics will be introduced as the corresponding planning capabilities are implemented.

---

## 🔄 How GridFlow Works

**Step 1 — Add delivery orders**

Enter delivery locations, load requirements, and priorities.

**Step 2 — Register vehicles**

Define available vehicles, capacities, and depot information.

**Step 3 — Generate a dispatch plan**

The engine assigns eligible orders to vehicles and calculates an initial stop sequence.

**Step 4 — Review the plan**

Inspect vehicle loads, estimated routes, and unassigned orders.

**Step 5 — Simulate a disruption**

Mark a vehicle unavailable or introduce an urgent delivery.

**Step 6 — Compare and save**

Review how the revised plan differs from the original before adopting it.

---

## 🧠 Optimization Approach

GridFlow will begin with understandable, deterministic algorithms rather than introducing complex machine learning prematurely.

### Phase A — Capacity-Aware Assignment

Use a greedy assignment heuristic:

1. Sort orders by priority and configurable planning rules.
2. Identify vehicles with sufficient remaining capacity.
3. Select an eligible vehicle using a simple allocation strategy.
4. Update remaining vehicle capacity.
5. Record unassigned orders and their reasons.

**Goal:** Produce valid, explainable vehicle assignments.

### Phase B — Route Sequencing

Start with a nearest-neighbor heuristic to generate multi-stop routes.

Apply a 2-opt local improvement algorithm to attempt to reduce route distance.

For early demonstrations, geographic distance can be approximated using the Haversine formula. Road-network travel distances can be added later through a routing service.

**Goal:** Improve basic routes without claiming mathematical optimality.

### Phase C — Time-Window Awareness

Extend route planning with estimated arrival times, delivery service durations, and time-window checks.

Infeasible deliveries can be flagged or left unassigned.

Initial arrival estimates will use simplified travel-time assumptions, so they will not represent live traffic predictions.

### Phase D — Disruption-Based Replanning

When a scenario changes:

1. Preserve the existing plan.
2. Apply the simulated disruption.
3. Recalculate affected assignments and routes.
4. Create a new plan version.
5. Compare results.

**Goal:** Demonstrate how operational changes affect delivery feasibility and route efficiency.

---

## 🏗️ System Architecture

GridFlow follows a modular monolithic architecture to keep development manageable.

```text
               REACT DASHBOARD
      Orders | Fleet | Plans | Simulation
                       |
                    REST API
                       |
                NODE + EXPRESS
                       |
        +--------------+--------------+
        |              |              |
    Order & Fleet   Planning      Scenario
      Services       Engine        Service
        |              |              |
        +--------------+--------------+
                       |
                  POSTGRESQL
        Orders | Vehicles | Plan Versions
```

All planning algorithms will initially run within the Node.js backend.

Background workers, geospatial database extensions, and real-time event processing will only be considered if later requirements justify them.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database access | `pg` (node-postgres) |
| Configuration | dotenv |
| API | REST, JSON, CORS |
| Optimization | Greedy assignment, nearest-neighbor, 2-opt |
| Visualization | React-based tables and route views |
| Development | Git, GitHub |

A dedicated mapping or routing library may be added when geographic route visualization is implemented.

---

## 📦 Initial Data Models

The database will begin with a small set of core entities.

**Orders:** ID, delivery location, load units, priority, status, and optional delivery window.

**Vehicles:** ID, capacity units, availability status, and depot association.

**Plans:** ID, creation time, scenario type, parent plan reference, and planning summary.

**Plan Stops:** Plan ID, vehicle ID, order ID, stop sequence, and estimated metrics.

Using one clearly defined load unit initially keeps capacity validation straightforward. More complex dimensions such as weight and volume can be introduced later.

---

## 🔌 Planned REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API and database readiness |
| GET / POST | `/api/orders` | List and create orders |
| PATCH | `/api/orders/:id` | Update an order |
| GET / POST | `/api/vehicles` | List and create vehicles |
| PATCH | `/api/vehicles/:id` | Update vehicle information |
| POST | `/api/plans` | Generate and save a plan |
| GET | `/api/plans/:id` | Retrieve a saved plan |
| POST | `/api/plans/:id/replan` | Create a revised plan from a scenario |
| GET | `/api/plans/:id/compare/:otherId` | Compare two plans |

These endpoints represent the intended API, not completed functionality.

---

## 🗺️ Development Roadmap

### Milestone 1 — Backend Foundation

- [ ] Set up Express server and environment configuration
- [ ] Establish PostgreSQL connection
- [ ] Create initial database schema
- [ ] Implement order and vehicle CRUD APIs
- [ ] Add request validation and error handling

**Deliverable:** A working backend that manages orders and vehicles.

### Milestone 2 — First Dispatch Engine

- [ ] Implement capacity-aware assignment
- [ ] Track remaining vehicle capacity
- [ ] Identify and explain unassigned orders
- [ ] Generate routes using nearest-neighbor
- [ ] Save generated plans in PostgreSQL
- [ ] Add automated tests for planning constraints

**Deliverable:** A usable API-based dispatch planner.

### Milestone 3 — Interactive Dashboard

- [ ] Build order management screens
- [ ] Build vehicle management screens
- [ ] Add a plan generation interface
- [ ] Display routes, stops, and capacity utilization
- [ ] Display unassigned orders and warnings

**Deliverable:** An end-to-end application for generating and reviewing plans.

### Milestone 4 — GridFlow Disruption Lab

- [ ] Simulate vehicle unavailability
- [ ] Simulate an incoming urgent order
- [ ] Regenerate affected plans
- [ ] Preserve plan versions
- [ ] Compare original and revised plans

**Deliverable:** A working what-if logistics simulator.

### Future Enhancements

- [ ] Delivery time-window constraints
- [ ] 2-opt route improvements
- [ ] Road-network distance integration
- [ ] CSV order import
- [ ] Map-based route visualization
- [ ] Additional planning heuristics

---

## 🧪 How Will GridFlow Be Evaluated?

GridFlow will be tested using repeatable sample delivery scenarios.

**Correctness checks:**
- No vehicle exceeds its defined capacity.
- An order is assigned to at most one vehicle within a plan.
- Unavailable vehicles receive no new assignments.
- All unassigned orders are reported.
- Saved original plans remain unchanged after replanning.

**Planning quality checks:**
- Compare estimated route distances against a simple input-order baseline.
- Measure capacity utilization across vehicles.
- Track orders that remain unassigned.
- Compare outcomes before and after simulated disruptions.

The aim is to demonstrate measurable improvements where possible, not to assume every optimization method will always outperform a baseline.

---

## 🎯 MVP Scope

The initial target is a **single-depot delivery operation with approximately 3–10 vehicles and 20–100 orders in a planning batch**.

To keep the first version achievable:

- Deliveries start from one depot.
- Vehicle capacity uses one consistent load unit.
- Routes are planned in batches rather than continuously.
- Traffic conditions are not predicted live.
- Vehicle positions are not tracked by GPS.
- Replanning is initiated through a user action.
- Route estimates are clearly distinguished from real-world travel guarantees.

This scope makes it possible to validate the full planning workflow before adding advanced logistics constraints.

---

## 🌱 Project Vision

GridFlow is being built as a practical exploration of logistics algorithms, backend engineering, database design, and decision-support interfaces.

Its long-term direction is to help dispatchers move from manual planning to **transparent, constraint-aware, and adaptable delivery decisions**.

**GridFlow — Plan. Explain. Adapt.**
