# NEU Library Management System

This is a NextJS 15 application integrated with Firebase, designed for library visitor tracking, role-based access control, and administrative analytics for New Era University.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React
- **Database**: **Firebase Firestore (NoSQL)**
- **Authentication**: Firebase Auth (Google SSO + RFID Simulation)
- **Reporting**: jsPDF for visitor logs

## Key Features
- **Kiosk Entrance/Exit**: Support for RFID scanning and Google SSO.
- **Role-Based Access**: Specialized handling for Students, Professors, and Staff.
- **Admin Dashboard**: Real-time stats, dynamic filtering (by Reason, College, and Role), and user blocking.
- **Automated Seeding**: Quick setup for testing with predefined university accounts.

## How to Upload to GitHub
1. **Find the Download Button**:
   - **Step A**: Look at the **very top center** of your screen where it says **"NEU Library FINAL!"**.
   - **Step B**: Click on that text (**"NEU Library FINAL!"**). A dropdown menu will appear.
   - **Step C**: Select **"Download project as ZIP"**. This will give you one file containing everything.
2. **Extract the ZIP**: Unzip the folder on your computer.
3. **Open Terminal**: Navigate into the project folder on your computer.
4. **Run these commands**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of NEU Library System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Local Development
1. Install dependencies: `npm install`
2. Run the dev server: `npm run dev`
3. Access the kiosk at `http://localhost:9002`
