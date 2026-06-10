# ModManager - Moderator & Order Management System

ModManager is a centralized sales and moderator management portal designed for e-commerce businesses that employ remote sales agents or moderators to handle customer orders. It provides a secure, role-based platform to manage order submissions, track moderator performance via a point-reward system, record order profits, and visualize business growth analytics.

---

## 👥 Who is it for?

### 1. **Administrators (Business Owners/Managers)**
- Oversee all system activities, sales logs, and moderator accounts.
- Approve or suspend moderator registrations.
- Track business metrics like total orders, revenue, net profit, and cancelled order losses.
- Manually review orders, confirm fulfillment status, and log net profits per product.
- Generate invoice PDFs and export order sheets.

### 2. **Moderators (Sales Agents)**
- Submit new sales orders with customer info, product details, and shipping details.
- Track their personal profile details, point score, and fulfillment history.
- Earn score points as incentives for successfully completed sales.

---

## ⚙️ How it Works

### 1. **Moderator Onboarding & Status**
- New sales agents register via the **Sign Up** page.
- Their account status is set to `Pending` by default and they cannot access the system.
- An **Admin** reviews their profile in the "Moderator Accounts" section and changes their status to `Approved` or `Suspended`.

### 2. **Order Submission & Life Cycle**
- Approved moderators log in and submit sales orders. 
- The order status progresses through: `Pending` ➡️ `Confirmed` ➡️ `Delivered` (or `Cancelled`).
- Admins manage the status updates in the **Client Sales Orders** section.

### 3. **Gamified Points Reward System**
Moderator points are automatically recalculated dynamically based on their orders' statuses:
- **Pending Order**: `+1 point` (reward for submitting the order)
- **Confirmed Order**: `+6 points` (`+1` for submission + `+5` for admin confirmation)
- **Delivered Order**: `+16 points` (`+1` for submission + `+5` for confirmation + `+10` for final delivery)
- **Cancelled Order**: `+0 points` (points are forfeited if the order is cancelled)

### 4. **Financial Tracking: Profit & Loss**
- **Profit Tracking**: For each order, the Admin can input the exact net profit amount (in BDT) next to the order total in the orders table. Clicking the confirm checkmark saves it to the database, disables the button (styled in green "Saved" state), and adds it to the system-wide profit tally.
- **Cancelled Orders Loss**: If an order is cancelled, a standard loss of **120 BDT** (e.g. shipping/packaging cost) is automatically calculated. The total loss is displayed on the admin dashboard.

### 5. **Admin Dashboard KPIs & Charts**
The main Admin Console Overview displays:
- **Total Sales Orders**: Total orders processed and current status overview.
- **Total System Revenue**: Total money received from confirmed & delivered orders.
- **Total Profit**: Live cumulative sum of all confirmed order profits.
- **Pending Orders**: Count of orders waiting for admin approval.
- **Cancelled Orders (Loss)**: Dynamic loss value (`Cancelled Count * 120 BDT`) and count of failed orders.
- **Performance Analytics**: Recharts visualizations for monthly sales/orders trends, top moderators by points, and order status distribution proportions.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Language**: TypeScript
- **Database**: MongoDB Atlas via Mongoose ODM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Popups & Toasts**: SweetAlert2 & React Hot Toast
- **Utility**: XLSX (for Excel exports)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone or download the project directory.
2. Install the package dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables by creating a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_jwt_secret_string
   ```
   *(Note: A fallback MongoDB Atlas URI is already configured in `src/lib/db.ts` for testing).*

### Running the App

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📄 License
This software is built for client-specific operations and is subject to private commercial licensing.
