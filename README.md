# ThreadHive Backend

A RESTful API backend for **ThreadHive** — a social media platform where users can create communities (like subreddits), post discussion topics, add comments, vote, and interact with content.

Built with **Node.js**, **Express**, and **MongoDB Atlas** via **Mongoose**.

---

## Features

- **Authentication** — Register, login, JWT-protected routes
- **Communities** — Create, browse, join/leave communities (subreddit-like)
- **Posts** — Create text/link/image posts inside communities; sort by new or top
- **Comments** — Nested threaded comments with soft delete
- **Votes** — Upvote/downvote posts and comments (toggle support)
- **Users** — Public profiles, post & comment history

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Runtime    | Node.js                           |
| Framework  | Express                           |
| Database   | MongoDB Atlas                     |
| ODM        | Mongoose                          |
| Auth       | JSON Web Tokens (JWT) + bcryptjs  |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works)

### Installation

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret

# 3. Start the server
npm start
```

---

## Environment Variables

| Variable       | Description                                  |
|----------------|----------------------------------------------|
| `PORT`         | Port to run the server on (default: 5000)    |
| `MONGODB_URI`  | MongoDB Atlas connection string              |
| `JWT_SECRET`   | Secret key for signing JWT tokens            |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`)          |

---

## API Endpoints

### Auth
| Method | Path                  | Auth | Description          |
|--------|-----------------------|------|----------------------|
| POST   | `/api/auth/register`  | —    | Register a new user  |
| POST   | `/api/auth/login`     | —    | Login and get token  |
| GET    | `/api/auth/me`        | ✅   | Get current user     |

### Communities
| Method | Path                              | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| GET    | `/api/communities`                | —    | List / search communities |
| POST   | `/api/communities`                | ✅   | Create a community       |
| GET    | `/api/communities/:name`          | —    | Get community details    |
| PUT    | `/api/communities/:name`          | ✅   | Update community (mod)   |
| POST   | `/api/communities/:name/join`     | ✅   | Join a community         |
| POST   | `/api/communities/:name/leave`    | ✅   | Leave a community        |
| GET    | `/api/communities/:name/posts`    | —    | List posts in community  |
| POST   | `/api/communities/:name/posts`    | ✅   | Create post in community |

### Posts
| Method | Path                     | Auth | Description        |
|--------|--------------------------|------|--------------------|
| GET    | `/api/posts`             | —    | List all posts     |
| GET    | `/api/posts/:id`         | —    | Get post details   |
| PUT    | `/api/posts/:id`         | ✅   | Edit post (author) |
| DELETE | `/api/posts/:id`         | ✅   | Delete post        |
| POST   | `/api/posts/:id/vote`    | ✅   | Vote on a post     |
| GET    | `/api/posts/:id/comments`| —    | Get post comments  |
| POST   | `/api/posts/:id/comments`| ✅   | Add a comment      |

### Comments
| Method | Path                        | Auth | Description          |
|--------|-----------------------------|------|----------------------|
| GET    | `/api/comments/:id/replies` | —    | Get nested replies   |
| PUT    | `/api/comments/:id`         | ✅   | Edit comment         |
| DELETE | `/api/comments/:id`         | ✅   | Delete comment       |
| POST   | `/api/comments/:id/vote`    | ✅   | Vote on a comment    |

### Users
| Method | Path                          | Auth | Description          |
|--------|-------------------------------|------|----------------------|
| GET    | `/api/users/:username`        | —    | Get user profile     |
| GET    | `/api/users/:username/posts`  | —    | Get user's posts     |
| GET    | `/api/users/:username/comments`| —   | Get user's comments  |
| PUT    | `/api/users/me`               | ✅   | Update own profile   |

---

## Project Structure

```
├── server.js               # Entry point
├── src/
│   ├── app.js              # Express app setup
│   ├── config/
│   │   └── db.js           # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Community.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Vote.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── communityController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── communities.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   └── users.js
│   └── middleware/
│       ├── auth.js
│       └── errorHandler.js
└── .env.example
```
