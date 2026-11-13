# Workasana

A full-stack task management and team collaboration application built to
help teams organize projects, assign tasks, manage deadlines, and track
work progress.
It provides a centralized workspace for managing teams, projects,
tasks and monitor progress.

## Quick Start

### Frontend

git clone https://github.com/rashmiw333/Worksana.git
cd clone https://github.com/rashmiw333/Worksana.git
npm install
npm run dev

### Backend

git clone https://github.com/rashmiw333/Workasana_Backend.git
cd https://github.com/rashmiw333/Workasana_Backend.git
npm install
node index.js

The backend uses port `5000` locally unless the `PORT` environment
variable is configured.


## Technologies

-   React
-   JavaScript
-   Bootstrap
-   Context API
-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JSON Web Tokens (JWT)
-   bcryptjs
-   REST APIs
-   Vercel


## Features

### Authentication

-   User signup and login.
-   Password hashing with bcryptjs.
-   JWT-based authentication.
-   Protected application routes.
-   Authenticated API requests using a Bearer token.
-   Logout and authentication state handling.

### Dashboard

-   View a summary of work and assigned tasks.
-   View projects and tasks relevant to the logged-in user.
-   Navigate to the main areas of the application.

### Project Management

-   Create projects with a name and description.
-   View available projects.
-   Associate tasks with projects.

### Team Management

-   Create and view teams.
-   Organize work around teams.
-   Associate tasks with the relevant team.

### Task Management

-   Create tasks and provide task details.
-   Assign tasks to owners.
-   Associate tasks with projects and teams.
-   Set due dates and track time to complete.
-   Organize tasks using tags.
-   Set task status and priority.
-   View task ,edit and delete tasks.
-   Filter tasks using supported task attributes and URL query
    parameters.
-   View tasks assigned to the logged-in user.

### Reports

-   View task reporting information.
-   Review pending work.
-   Review completed work.
-   Use report data to understand task progress.

## API Reference

The backend exposes REST APIs for authentication, users, teams,
projects, tags, tasks, and reports. The following routes reflect the
application endpoints used during development.

### Authentication

  Method   Endpoint         Purpose
  -------- ---------------- -----------------------------------------------
  POST     `/auth/signup`   Register a user
  POST     `/auth/login`    Log in a user
  GET      `/auth/me`       Retrieve the authenticated user's information

### Users

  Method   Endpoint   Purpose
  -------- ---------- ----------------
  GET      `/users`   Retrieve users

### Teams

  Method   Endpoint   Purpose
  -------- ---------- ----------------
  POST     `/teams`   Create a team
  GET      `/teams`   Retrieve teams

### Projects

  Method   Endpoint      Purpose
  -------- ------------- -------------------
  POST     `/projects`   Create a project
  GET      `/projects`   Retrieve projects

### Tags

  Method   Endpoint   Purpose
  -------- ---------- ---------------
  POST     `/tags`    Create a tag
  GET      `/tags`    Retrieve tags

### Tasks

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  POST                    `/tasks`                Create a task

  GET                     `/tasks`                Retrieve tasks;
                                                  supports the filters
                                                  implemented by the
                                                  backend

  GET                     `/tasks/:id`            Retrieve a task by ID

  PUT                     `/tasks/:id`            Update a task

  DELETE                  `/tasks/:id`            Delete a task
  -----------------------------------------------------------------------

### Reports

  Method   Endpoint                 Purpose
  -------- ------------------------ -------------------------------------
  GET      `/report/last-week`      Retrieve the last-week report
  GET      `/report/pending`        Retrieve pending-work report data
  GET      `/report/closed-tasks`   Retrieve completed-task report data

Protected endpoints require the access token in the request header


## Application Structure

The project is organized around frontend pages and reusable components,
with a Node.js/Express backend and separate Mongoose models.

### Frontend areas

-   Authentication pages
-   Dashboard
-   Projects
-   Teams
-   Tasks
-   Task details and editing
-   Reports
-   Shared authentication context and navigation

### Backend areas

-   Express application and API routes
-   Authentication and JWT middleware
-   MongoDB connection
-   User, team, project, tag, and task models

## Learning Highlights

-   Implemented authentication using JWT and protected routes in a React
    application.
-   Connected React pages to REST APIs built with Node.js and Express.
-   Designed MongoDB relationships between users, teams, projects, tags,
    and tasks using Mongoose references.
-   Implemented task assignment and user-specific task retrieval.
-   Used URL query parameters to filter task data.
-   Built project, team, and task management workflows.
-   Worked with reporting endpoints to summarize pending and completed
    work.
-   Deployed the frontend and backend using Vercel.


## Repository

Frontend (https://github.com/rashmiw333/Worksana)

Backend (https://github.com/rashmiw333/Workasana_Backend)


## Vercel

Frontend: https://worksana-app.vercel.app/dashboard

Backend: https://workasana-backend-xi.vercel.app/

## Contact

For bugs or feature requests, please reach out to:

rashmiwankhade99@gmail.com
