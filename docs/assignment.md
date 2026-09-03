# Assignment 1: Secure Networking Tracker

## Build, secure, test, document, and deploy a complete full-stack web application.

# Overview

Build a networking tracker for the people you want to stay connected with at Berkeley. Submit one public GitHub repository URL. Its README must let a grader open the live app, understand the system, and verify every rubric requirement.

# What You Are Shipping

* A public web application deployed on Vercel  
* A sign-in and sign-out flow using Neon Managed Better Auth  
* A private contact list for each authenticated user  
* Create, view, edit, delete, sort, and filter contact records  
* Persistent data stored in Neon Postgres  
* Backend validation and at least one automated test  
* A complete README that explains how the system works

# Required Technology Stack

* Frontend and backend separated  
* Styling with a design or component system  
* Database and authentication: Neon Postgres, Managed Better Auth, and the Neon Data API  
* Hosting: Vercel  
* Source control: Git and GitHub

# Functional Requirements

* Users can sign up or sign in and can sign out  
* Users can add a contact with name, company, role, where they met, notes, and priority  
* Priority accepts only high, medium, or low  
* Users can view their contacts in a clear sortable list or table  
* Users can edit and delete their own contacts  
* Contacts survive a browser refresh  
* Empty names and invalid priority values fail with a clear error message  
* Loading, empty, success, and error states are understandable  
* The ui has to be both web and mobile friendly

# Security Requirements

* The contacts table includes a text user\_id that defaults to auth.user\_id() and cannot be null  
* Row Level Security is enabled on the contacts table  
* Separate select, insert, update, and delete policies apply to authenticated users  
* Every policy restricts access to rows where user\_id matches the signed-in user  
* Update policies prevent a user from changing a row so it belongs to someone else  
* Two test accounts prove that User A cannot read or change User B's contacts  
* The frontend may use the public Neon Auth and Data API URLs; RLS must protect every exposed contacts row  
* The Postgres connection string, cookie secret, and all other secrets stay server-only and are never committed to Git

# Environment Variables

Commit an .env.example file with variable names and placeholder values. Keep the real .env.local file out of Git. Use the HTTPS Auth and Data API endpoints in public variables. Never expose the Postgres connection string.

* NEXT\_PUBLIC\_NEON\_AUTH\_URL  
* NEXT\_PUBLIC\_NEON\_DATA\_API\_URL  
* DATABASE\_URL, NEON\_AUTH\_BASE\_URL, and NEON\_AUTH\_COOKIE\_SECRET must be server-only if your implementation uses them

# README Requirements

The README is the complete grading surface. A grader should need only the public GitHub repository URL to understand, run, test, and evaluate the project.

* Project title and one-paragraph overview  
* Live Vercel URL  
* Screenshots or a short product walkthrough  
* Feature list  
* Technology stack and why you chose it  
* Architecture summary explaining frontend, backend, database, authentication, and hosting  
* Local setup instructions from clone through npm run dev  
* Required environment-variable names without real secret values  
* Database schema with every contacts-table column  
* Authentication and RLS ownership explanation  
* Test command and what the automated test verifies  
* Deployment instructions  
* Known limitations and what you would improve next

# Recommended Implementation Workflow

1. Create the project and Git repository.  
2. Write the README outline before building so the requirements stay visible.  
3. Ask your AI coding agent for a plan and review the files it proposes to create.  
4. Create the Neon project, enable Managed Better Auth and the Data API, then create the contacts schema and RLS policies.  
5. Build the smallest complete contact workflow from the UI through the database.  
6. Add backend validation and an automated test.  
7. Run the app locally and verify the two-user privacy test.  
8. Push the repository to GitHub and deploy it on Vercel.  
9. Configure production environment variables and run the full verification checklist on the live URL.  
10. Finish the README with the live URL, screenshots, architecture, schema, tests, and deployment notes.

# Starter Prompt for Your Coding Agent

Plan and build a secure networking tracker with separate frontend and backend logic, Neon Postgres, Managed Better Auth, the Neon Data API, and a Vercel deployment. Use @neondatabase/neon-js with its two-URL object form for authentication and data access. Create a contacts table with a text user\_id that defaults to auth.user\_id(). Enable RLS and create ownership policies for select, insert, update, and delete using auth.user\_id() \= user\_id, including WITH CHECK for inserts and updates. Build create, view, edit, delete, sort, and filter behavior. Validate required fields and priority values in trusted server or database code. Add at least one automated test. Create .env.example with only placeholder values, keep DATABASE\_URL and every other secret server-only, and write a complete README covering setup, architecture, schema, security, testing, and deployment. Show me the plan before changing files, then implement the smallest complete version.

# Evidence Required in the README

* Automated test output showing at least one passing validation test  
* A screenshot or recording of sign-in and sign-out  
* A screenshot or recording of creating, editing, deleting, and refreshing a contact  
* A two-account test showing that one user cannot access the other user's contacts  
* A screenshot of one invalid input failing safely  
* A brief explanation of the contacts schema and RLS ownership rule  
* A GitHub repository with no committed secret values

# Deployment Checklist

1. Push the final repository to GitHub.  
2. Import the repository into Vercel or deploy it with the Vercel CLI.  
3. Add the production environment variables in Vercel.  
4. Add the deployed Vercel domain to Neon Auth's trusted origins and confirm sign-in works there.  
5. Open the public URL in a private browser window.  
6. Create two accounts and repeat the privacy test in production.  
7. Run every Definition of Done check against the deployed application.  
8. Add the live URL and every grading artifact to the README.

# Definition of Done

* The application is live at a public URL  
* A user can sign in and sign out  
* A user can add, view, edit, delete, sort, and filter contacts  
* Data survives refresh because it is stored in Neon Postgres  
* User A cannot see or change User B's contacts  
* Invalid data fails safely with a clear message  
* At least one automated test passes  
* No DATABASE\_URL, cookie secret, or other secret appears in frontend code or Git history  
* The README contains every required section and all grading evidence  
* You can explain the schema, RLS rule, and request flow without relying on the AI agent

# Single Deliverable

* One public GitHub repository URL. The README contains the live app URL and every grading artifact listed above.

# Scope Boundaries

* No AI feature is required  
* No admin dashboard is required  
* No contact sharing or team workspace is required  
* A small secure application is better than a large unfinished one

