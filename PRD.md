# Product Requirements Document (PRD) - MJP Water Billing System

This document outlines the enhancements required for the Maharashtra Jeevan Pradhikaran (MJP) Water Billing System website to make it production-ready, secure, and robust.

## Core Requirements

### 1. Data Persistence Layer (localStorage)
* **Goal**: Ensure all data modifications (adding/editing/deleting clients, generating/deleting bills, paying bills, and managing users) persist across browser reloads.
* **Requirements**:
  * Check for existing data in browser `localStorage`.
  * If found, load and initialize `dbData` from `localStorage`.
  * If not found, use the default seeded database from `data.js`, and save it to `localStorage` immediately.
  * Serialize and write the updated state back to `localStorage` whenever any change occurs (add/edit/delete operations).

### 2. Bill Payment Status & History Preservation
* **Goal**: Avoid deleting bills when they are paid, preserving billing history in the admin panel.
* **Requirements**:
  * Add a `status` field (`"Pending"` or `"Paid"`) to all bills. Existing seed bills default to `"Pending"`.
  * When a customer pays a bill via the public e-Pay page, update its status to `"Paid"` instead of deleting the bill record.
  * Update the e-Pay search query to only show `"Pending"` bills for payment.
  * Render status badges (`Paid` / `Pending`) in the admin billing management table.
  * Update the dashboard statistics calculation:
    * Total Revenue should represent either the sum of all paid bills or show separate stats for Collected Revenue vs. Outstanding Revenue. Let's display both: **Collected Revenue** (total paid) and **Outstanding Bills** (total pending).

### 3. Role-Based Access Control (RBAC)
* **Goal**: Enforce security permissions according to user levels defined in the database.
* **Requirements**:
  * User roles are defined by `userlevel` in `user_levels`:
    * Level 1 (`userlevel: "1"`): Regular operator.
    * Level 2 (`userlevel: "2"`): System Administrator.
  * When logged in:
    * Level 1 operators should NOT see the "Users" navigation link and must be blocked from accessing the User Management tab.
    * Level 2 administrators have full access, including User Management.
  * Ensure the active user's permissions are checked when rendering views.

### 4. Form Validation & Data Integrity
* **Goal**: Prevent garbage data entry and calculation bugs.
* **Requirements**:
  * **Bill Generation**: Validate that `Present Reading >= Previous Reading`. Show an error notification and block submission if invalid.
  * **Client Forms**: Validate contact number format (10-digit number) and ensure required fields are not empty.
  * **User Forms**: Ensure username and full name are not empty. Validate that usernames are unique.

### 5. UI/UX Polish & Toast Notifications
* **Goal**: Improve interactive feedback and dashboard presentation.
* **Requirements**:
  * Implement toast notifications (toast alerts) for action feedback (e.g., "Client added successfully", "Payment completed", "Error: Present reading cannot be lower than previous").
  * Format tables and status badges beautifully to look modern and premium.
  * Ensure smooth styling transitions on views.
