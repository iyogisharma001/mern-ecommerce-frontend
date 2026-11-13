# ⚙️ MERN E-Commerce Backend Microservice & API Engine

A robust RESTful backend engine powering a multi-feature e-commerce platform and real-time admin analytics dashboard. Built with Node.js, Express.js, TypeScript, and MongoDB.

Developed & Maintained by **Yogesh Sharma** ([GitHub](https://github.com/iyogisharma001) | [LinkedIn](https://www.linkedin.com/in/yogesh-sharma-597466325/)).

---

## 🛠️ Tech Stack & Key Technologies

- **Server Runtime:** Node.js & Express.js (TypeScript)
- **Database Layer:** MongoDB with Mongoose ODM
- **Caching Layer:** NodeCache (In-memory server caching for high-speed read queries)
- **Payment Processing:** Stripe REST API & Payment Intents
- **Security & Authentication:** Firebase Admin SDK & CORS middleware

---

## ⚡ Architecture Highlights & Features

- **Complex Aggregation Pipelines:** Custom MongoDB `$group`, `$match`, and `$project` aggregation pipelines driving the dynamic Admin Dashboard analytics (calculating total revenue, monthly performance splits, transaction counts, and inventory distribution).
- **Server-Side Query Caching:** Integrated in-memory caching to serve high-frequency product catalog reads, significantly reducing database IOPS and improving response latency.
- **Cache Invalidation Workflow:** Built-in cache purging strategy attached to mutation endpoints (`POST`, `PUT`, `DELETE`), ensuring zero stale data delivery to client apps.
- **Role-Based Endpoint Protection:** Security middleware restricting administrative analytics and product management endpoints exclusively to authorized admins.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
Ensure you have Node.js (v18+) and MongoDB installed locally or access to a MongoDB Atlas cluster.

### 2. Installation
Clone the backend repository and install dependencies:
```bash
git clone [https://github.com/iyogisharma001/mern-ecommerce-backend.git](https://github.com/iyogisharma001/mern-ecommerce-backend.git)
cd mern-ecommerce-backend
npm install
## Deployment

The frontend runs on **Vercel** (`vercel.json` sends every route to the React app) and the backend on **Render**. Follow the step-by-step guide in the backend repo: [DEPLOY.md](https://github.com/iyogisharma001/mern-ecommerce-backend/blob/main/DEPLOY.md).
