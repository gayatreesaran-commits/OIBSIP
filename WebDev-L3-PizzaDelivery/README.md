# Pizza Delivery Platform

Full-stack pizza ordering and inventory management app (OIBSIP Web Development, Level 3).

- **Customers** register (email verification), build a custom pizza or pick from the menu, pay, and follow the order live.
- **Admins** manage stock, receive low-stock alerts by email, and move orders through the kitchen.

Stack: React + Vite, Node.js + Express 5, MongoDB Atlas (Mongoose), JWT, Razorpay (test mode), nodemailer, node-cron.

> Status: under construction. Setup, configuration reference and demo steps land with the final slice.

## Layout

| Path | Purpose |
|---|---|
| `server/` | REST API. Layered: routes, controllers, services, repositories, models. |
| `client/` | React single-page app. Feature-folder structure. |
| `docs/` | Architecture notes, configuration reference, demo script. |
