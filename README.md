# 🍽️ Recipe Tracker App

A full-stack recipe tracking and meal planning application that allows users to create, manage, and schedule recipes in one place.

I'm building this app to solve a problem I've been having recently, but also to improve my front-end development skills!

---

## 🚀 Planned Features

- 📖 Create, edit, and delete recipes
- 🧾 Store ingredients, instructions, and metadata
- 🗓️ Plan meals by day/week
- 🗂️ Persist data with a database
- ⚡ Simple UI with server-side rendering

---

## 🛠️ Tech Stack

**Frontend**
- React
- Next.js
- TypeScript
- TailwindCSS

**Backend**
- Node.js
- Next.js Server Components / API Routes
- Prisma ORM

**Database**
- SQLite
---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DanieruG/recipe-tracker.git
cd recipe-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="your_database_url_here"
```

### 4. Initialize Prisma

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` to view the app.

---

## 📌 Current Status

- ✅ Create plan page
- ✅ Add recipe page
- ✅ Prisma initialized
- ⏳ Form validation, and posting (current!)
- ⏳ Meal scheduling logic
- ⏳ Building an interface to show created meals...
- ⏳ Authentication (not sure yet?)

---

## 🧩 Planned Improvements

- User accounts & authentication
- Weekly calendar view
- Nutrition/macros tracking (following key features)
- Recipe search & filters

---

## 🧪 Learning Goals

This project focuses on:
- Improving my familiarity with Typescript, React and Next.js
