# GridFlow

# 1. Product overview

GridFlow is an urban logistics planning and optimization platform that helps delivery operators assign orders to vehicles, plan efficient delivery routes, monitor fleet utilization, and adapt to unexpected disruptions.

The platform will initially use simulated delivery data and a single depot. Later, it can support real business data, multiple depots, more complex vehicle constraints and live tracking.

## 2. Problem statement

Small and medium-sized delivery operators often plan routes and assign orders manually. This can result in:

- Vehicles being underutilized while others are overloaded.
- Unnecessarily long delivery routes.
- Missed delivery deadlines.
- Poor visibility into fleet utilization and operating costs.
- Difficulty responding to vehicle breakdowns or urgent orders.

GridFlow aims to make these decisions easier through a centralized dashboard and progressively more advanced optimization algorithms.

## 3. Target users

| User          | Main needs                                       |
| ------------- | ------------------------------------------------ |
| Fleet manager | Monitor vehicles, costs and delivery performance |
| Dispatcher    | Assign orders and plan routes                    |
| Driver        | View assigned deliveries and update statuses     |
| Administrator | Manage users, vehicles and system settings       |

For the initial MVP, implement Admin/Dispatcher and Driver roles. A separate administrator permission hierarchy can be added later.

## 4. Technology stack

[React Logo Vector PNG | Modern JavaScript UI Library Emblem  - freepng](https://images.openai.com/static-rsc-4/v_YRxkVgaIO4SDeoNvs8wqFWCUPPpZZsL5kVx_ktDQiKtZgMAHiSkxHMJjDkyVuTICNI24RF-lwOIJxaeydWu09nWdyQFsirfUWfJani7GSpYOfLBE-LNBdDDc_8acLBouV10tSEh5cWrc3WFWUieGkP2unLzBMX37Q6Sq2WqGs?purpose=inline)

Frontend — React + Vite

React Router, Tailwind CSS, Axios, Leaflet and Recharts.

[LF开源软件学园 - 专区 - OSCHINA - 中文开源技术交流社区](https://images.openai.com/static-rsc-4/zswQ_R6YndCQBWvCz-IuR_j-oY-paC_fLt6CP04oEIyjauiRJ5eHFIVssxWAEp3WwvgQo1wIF_APQHNhJXM1vCA6FZQVivzVVrB7kIHYGHAxzfhmfAhZI4LQ9d4xQpdQYaqYyJwqyoMTLdDF64tVOF17D-2Xv36fgFKh0myOVHY?purpose=inline)

Backend — Node.js + Express

REST APIs, validation, authentication and business logic.

[Homepage | DAO Systems Latino América](https://images.openai.com/static-rsc-4/S5rfUWpdahNrwuWj5WLrEglYfYQvGIihldTZtMXN3rhPAz_mzayK7AxRC9-_byOkD6dL65Y3EHx7iVS75PihiX34gaj0l8Dg2MOftoc5qTVT_Yie_nrO0ZAKPUEmmZ0hNjxtiqFUvnpqbHXBoJrQDmWvrpzzPSZUtb2UU8KpMPw?purpose=inline)

Database — PostgreSQL + PostGIS

Relational data, location queries, delivery records and plan history.

[What are the pricing options for Redis?](https://images.openai.com/static-rsc-4/cxD0mNwOFZou3c4Llf54BhJRBatnwNaB1PRyLFmIPi8T_DppI8Tx5eXaldNM50YFgyAVtop1YVxSro1--SPQPyUwd84VpfhigqOETDMxnOrMCs17WGKsFDxEhnu6gcrlkKs6d9R4wQpKeQAR5180qRPJtYD1UoA32ydSYxE5k1U?purpose=inline)

Later — Redis + BullMQ

Background optimization jobs, retries and job progress.

Additional integrations:

- Leaflet + OpenStreetMap: interactive map.
- OSRM: road routes and travel-time estimates.
- Socket.IO: live status updates in a later phase.
- Docker: repeatable development and deployment.

Keep the first version simple: no microservices, Kubernetes, or AI dependency.

# 5. Functional requirements

## Module A — Authentication and access control

- Register and log in users.
- Hash passwords securely.
- Issue JWT access tokens.
- Protect private API routes.
- Restrict dispatcher and driver actions by role.

Acceptance criteria: unauthenticated users cannot access protected APIs, and drivers cannot change fleet-wide settings.

## Module B — Fleet management

Dispatchers can create, view, edit and deactivate vehicles.

Each vehicle contains:

- Vehicle ID and registration label.
- Vehicle type.
- Maximum weight capacity in kg.
- Cargo dimensions: length, width and height.
- Availability status.
- Optional operating cost per kilometre.

For the MVP, vehicle capacity and availability are mandatory. Advanced driver shifts and road restrictions can come later.

## Module C — Order management

Dispatchers can create delivery orders with:

- Order ID and recipient label.
- Pickup/depot and delivery coordinates.
- Package weight and dimensions.
- Priority: normal, high or urgent.
- Delivery time window.
- Service duration at the destination.
- Status: pending, assigned, in transit, delivered or cancelled.

The system must reject invalid dimensions, negative weights and invalid delivery windows.

## Module D — Initial route planner

This is the first optimization feature, but it should begin with a basic working version.

1. Select pending orders.
2. Select available vehicles.
3. Assign orders that fit vehicle weight capacity.
4. Order the stops using a simple nearest-neighbour heuristic.
5. Display the route and estimated distance.
6. Allow the dispatcher to save and view the plan.

Initially, optimize one depot and a small dataset. Add delivery windows and more advanced assignment logic after this works.

## Module E — Dashboard and analytics

The main dashboard displays:

- Total orders and pending orders.
- Available and assigned vehicles.
- Completed deliveries.
- Planned route distance.
- Average vehicle capacity utilization.
- Baseline versus optimized performance, once both are implemented.

Do not display fabricated real-time statistics. Seeded demo data should be clearly identified as simulated.

## Module F — Cargo loading

A later module will use package dimensions and vehicle cargo dimensions to generate a feasible loading layout.

Requirements:

- Fit packages within the cargo boundaries.
- Prevent package overlap.
- Respect package orientation rules.
- Check vehicle weight limits.
- Display loading utilization and violations.

Start with a 2D top-down visualization. A 3D view can follow once the placement algorithm is correct.

## Module G — Dynamic replanning

After the static route planner is stable:

- Simulate a vehicle breakdown.
- Identify affected undelivered orders.
- Check available replacement vehicles.
- Reassign feasible orders.
- Recalculate routes and ETAs.
- Show differences from the previous plan.
- Require dispatcher confirmation before applying the changes.

Completed deliveries must never be reassigned.

# 6. Non-functional requirements

- Validate input on the server, not just in React.
- Use database transactions where multiple related records must change together.
- Keep optimization computation separate from Express route handlers.
- Prevent unauthorized access to another user's or organization's data.
- Handle failed routing requests and invalid coordinates gracefully.
- Test capacity constraints and route calculations.
- Record optimization inputs, algorithm version and results for reproducibility.

# 7. Database design

Use these core tables initially:

| Table         | Purpose                             |
| ------------- | ----------------------------------- |
| `users`       | Authentication and roles            |
| `vehicles`    | Vehicle capacities and availability |
| `orders`      | Delivery information and status     |
| `routes`      | Saved route plans                   |
| `route_stops` | Ordered stops and planned ETAs      |

Later additions:

- `optimization_runs` — inputs, results, duration and metrics.
- `plan_events` — breakdowns, urgent orders and replanning history.
- `packages` — individual parcels when an order has multiple packages.
- `drivers` — shift schedules and driver-specific constraints.

A route should have multiple stops, and each stop should reference its corresponding order. Store coordinates using appropriate geographic data types once PostGIS is configured.

# 8. API requirements

Initial REST endpoints:

| Method | Endpoint             | Purpose                     |
| ------ | -------------------- | --------------------------- |
| POST   | `/api/auth/register` | Register user               |
| POST   | `/api/auth/login`    | Login                       |
| GET    | `/api/vehicles`      | List vehicles               |
| POST   | `/api/vehicles`      | Create vehicle              |
| PATCH  | `/api/vehicles/:id`  | Update vehicle              |
| GET    | `/api/orders`        | List orders                 |
| POST   | `/api/orders`        | Create order                |
| PATCH  | `/api/orders/:id`    | Update order                |
| POST   | `/api/routes/plan`   | Generate initial route plan |
| GET    | `/api/routes`        | List saved routes           |
| GET    | `/api/routes/:id`    | Get route details           |

Keep the optimization logic in a separate service, for example `services/routeOptimizer.js`. The API should validate the request, invoke the service, and return the resulting plan.

# 9. Development roadmap — from zero to advanced

## Phase 1

Foundation

Project setup and basic CRUD

Initialize React and Express, connect PostgreSQL, create database tables, build vehicle and order CRUD APIs, and test them using Postman.

Completion: orders and vehicles can be created, edited and retrieved.

## Phase 2

MVP UI

Dashboard and dispatch interface

Build the main dashboard, order form, vehicle table, order list and interactive map using demo coordinates.

Completion: a dispatcher can manage the fleet from the browser.

## Phase 3

Algorithms

First working optimizer

Implement capacity-aware assignment, nearest-neighbour stop ordering and route display. Add OSRM integration and calculate baseline metrics.

Completion: the application generates a valid, saved delivery plan.

## Phase 4

Optimization

Constraint-aware planning

Add delivery time windows, service times, local-search improvements, infeasibility checks and benchmark comparisons.

Completion: compare two algorithms on identical datasets.

## Phase 5

Advanced

Cargo Lab and replanning

Add package placement, simulated disruptions, revised routes, saved plan versions and dispatcher approval.

Completion: the system recovers from a simulated vehicle breakdown without invalidating completed deliveries.

## Phase 6

Production

Reliability and deployment

Add background jobs, real-time updates, tests, Docker, error monitoring, a deployment pipeline and project documentation.

Completion: a publicly accessible demo with reproducible test scenarios.

# 10. MVP acceptance criteria

The initial MVP is complete when:

- A user can log in and manage vehicles and orders.
- Invalid orders and overweight vehicle assignments are rejected.
- The planner generates a route for feasible orders.
- Route stops appear in the correct sequence on a map.
- The dispatcher can save and reopen a plan.
- The dashboard displays metrics calculated from actual stored plans.
- The application handles infeasible orders without crashing.

Do not start cargo optimization, Redis queues or dynamic replanning until these criteria are met.

# 11. Final project deliverables

When the project is complete, aim to have:

- A deployed web application with demo credentials.
- A documented architecture and database schema.
- API documentation and meaningful test coverage.
- An algorithm comparison report using reproducible datasets.
- A short demo showing a breakdown and successful replanning.
- A README with real benchmark results and limitations.

The final resume entry should emphasize what you actually implemented and measured. Avoid claiming fuel savings or optimization percentages until you've benchmarked the engine against a defined baseline.

## Let's start with Phase 1

We will build this incrementally, explaining each file and the reasoning behind it. The first milestone is just the project structure, database connection, and vehicle/order CRUD APIs.

Once those work, we'll build the frontend and then the first routing algorithm. No need to understand the entire system before starting.