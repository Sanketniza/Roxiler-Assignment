# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# FullStack Intern Coding Challenge

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB

## Requirements
A web application for users to submit ratings (1-5) for stores registered on the platform. Single login system with role-based access:
- System Administrator
- Normal User
- Store Owner

### User Roles & Functionalities

#### System Administrator
- Add new stores, normal users, and admin users
- Dashboard: total users, stores, ratings
- Add users: Name, Email, Password, Address
- View stores: Name, Email, Address, Rating
- View users: Name, Email, Address, Role
- Filter listings by Name, Email, Address, Role
- View user details (Store Owner: show Rating)
- Logout

#### Normal User
- Sign up & log in
- Signup: Name, Email, Address, Password
- Update password
- View/search stores by Name/Address
- Store listings: Name, Address, Overall Rating, User's Rating, Submit/Modify rating
- Submit ratings (1-5)
- Logout

#### Store Owner
- Log in
- Update password
- Dashboard: users who rated their store, average rating
- Logout

### Form Validations
- Name: Min 20, Max 60 characters
- Address: Max 400 characters
- Password: 8-16 chars, 1 uppercase, 1 special char
- Email: Standard validation

### Additional Notes
- All tables support sorting
- Best practices for frontend/backend
- Database schema follows best practices

## Demo Credentials

### System Administrator
- **Email:** `sanket123@gmail.com`
- **Password:** `Sanket123`

### Normal User
- **Email:** `a@gmail.com`
- **Password:** `Sanket123`

### Store Owner
- **Email:** `b@gmail.com`
- **Password:** `Sanket123`

## Installation Process

```bash
# Frontend
cd Frontend
npm install
npm run dev

# Backend
cd Backend
npm install
npm start
```

## Website Link

<!-- Add your deployed website link here -->
