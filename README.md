# Scholarship Management System

A full-stack starter project for a scholarship management system using:

- MySQL Workbench / MySQL Server on `localhost:3306`
- Node.js + Express for the backend
- HTML, CSS, and JavaScript for the frontend

The project includes:

- Student registration, login, and forgot password with security question
- Student dashboard with summary cards
- Scholarship listing with search and filters
- Scholarship application form with document upload
- My applications page with status tracking
- Admin dashboard for verifying students and reviewing applications
- Profile and settings pages
- MySQL schema and seed scripts for Workbench

## Folder Structure

```text
database/               MySQL schema and seed files
public/                 Frontend pages and browser JavaScript
server/                 Node.js backend
```

## 1. Create the Database in MySQL Workbench

Open MySQL Workbench and run:

1. [`database/schema.sql`](C:/Users/uddes/Documents/Codex/2026-04-18-files-mentioned-by-the-user-synopsis/database/schema.sql)
2. [`database/seed.sql`](C:/Users/uddes/Documents/Codex/2026-04-18-files-mentioned-by-the-user-synopsis/database/seed.sql)

This creates a database called `scholarship_management_system` and inserts demo data.

## 2. Configure the Backend

Copy [`server/.env.example`](C:/Users/uddes/Documents/Codex/2026-04-18-files-mentioned-by-the-user-synopsis/server/.env.example) to `server/.env` and update your MySQL username and password.

Example:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=scholarship_management_system
PORT=4000
APP_SECRET=replace-this-with-a-long-random-secret
TOKEN_EXPIRY_HOURS=10
```

If your MySQL Workbench connection uses a different username than `root`, use that username instead.

## 3. Install Dependencies

```powershell
cd C:\Users\uddes\Documents\Codex\2026-04-18-files-mentioned-by-the-user-synopsis\server
npm install
```

## 4. Start the App

```powershell
npm run dev
```

Then open:

- [http://localhost:4000](http://localhost:4000)

## Demo Login

Student:

- Email: `student@scholarhub.local`
- Password: `Student@123`

Admin:

- Email: `admin@scholarhub.local`
- Password: `Admin@123`

## Optional Database Init Script

If you prefer, you can also initialize the schema and seed data from Node.js:

```powershell
cd C:\Users\uddes\Documents\Codex\2026-04-18-files-mentioned-by-the-user-synopsis\server
npm run init-db
```

## Main Pages Included

- `index.html`: login, register, forgot password
- `dashboard.html`: student dashboard
- `scholarships.html`: scholarship cards with filters
- `apply.html`: application form with upload
- `applications.html`: application status table
- `admin.html`: admin dashboard
- `profile.html`: profile management
- `settings.html`: password and security question updates

