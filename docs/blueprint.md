# **App Name**: NEU Library Admin Dashboard

## Core Features:

- Admin Dashboard Overview: Displays key aggregate statistics (Total Visitors, Bounce Rate, Avg. Session, Active Now) with real-time daily, weekly, and monthly counts fetched from Firestore.
- Traffic Overview & Device Tracking: Visualizes visitor traffic trends over time with a line chart and breaks down visitor sources (Desktop, Mobile, Tablet) using data from Firestore.
- Real-time Visitor Table: Presents a dynamic table of live visitor data, including user details (Name, Program) and their chosen visit reasons, sourced directly from the 'Logs' Firestore collection.
- Visitor Table Search & Filtering: Implements a comprehensive search box to filter the real-time visitor table entries by user Name, Program, or selected Reason for Visit, allowing efficient data exploration.
- User Status Management: Provides administrators with a toggle control within the visitor list to instantly block or unblock users, directly updating the 'isBlocked' status in the 'Users' Firestore collection.
- PDF Export of Filtered Data: Enables administrators to export the currently displayed and filtered visitor table data into a professionally formatted PDF file, complete with an 'NEU Library' header.
- Admin Authentication: Secure login mechanism for administrators, ensuring only authorized personnel can access and manage the dashboard functionalities.
- Firestore Security Rules Enforcement (Admin): Implements and enforces robust Firestore Security Rules to protect sensitive administrative data, ensuring only authenticated and authorized administrators can perform read/write operations.

## Style Guidelines:

- Background Color: A subtle, very light grayish-blue (#F7F8FC) for the overall dashboard background, creating a clean and spacious canvas.
- Card Background: Pure white (#FFFFFF) for data cards and panels, providing clear content separation and focus.
- Primary Accent Blue: A vibrant and professional blue (#3B71F2) used for primary interactive elements, chart lines, and selected states (e.g., 'Export PDF' button, 'Weekly' tab).
- Secondary Accent Turquoise: A refreshing turquoise-blue (#13BAD5) for secondary indicators or highlights, providing a modern complementary contrast.
- Text Color (Headings): Dark charcoal (#212529) for main headings and titles, ensuring high readability.
- Text Color (Body/Descriptions): Medium grey (#6C757D) for descriptive text and general body content, offering good legibility.
- Font Family: 'Inter' (sans-serif) for all text elements, providing a modern, clean, and highly readable appearance across the interface.
- Headings: Bold and prominently sized for emphasis, clearly distinguishing sections and key metrics.
- Body/Descriptions: Standard weight and size for clear, comfortable readability of detailed information and table entries.
- Style: Use clean, minimalistic line icons (e.g., dashboard, analytics, visitors, reports, settings, logout icons) that complement the professional and data-centric nature of the dashboard.
- Placement: Integrate icons within the sidebar navigation, data cards, and interactive elements for intuitive guidance and visual appeal.
- Overall Structure: A persistent left sidebar for navigation with a main content area structured into distinct, card-based sections for metrics and data visualization.
- Dashboard Panels: Data presented in clean, well-defined cards with rounded corners, emphasizing readability and visual hierarchy.
- Header: A top header containing the dashboard title, search bar, and primary action buttons (e.g., 'Export PDF').
- Tables: Real-time visitor data presented in clear, sortable tables with distinct rows and columns.
- Spacing: Ample use of whitespace to enhance readability, reduce visual clutter, and create a modern, spacious feel, as depicted in the UI reference.
- Transitions: Smooth and subtle transitions for UI element state changes and navigation, ensuring a fluid user experience.
- Interactive Feedback: Gentle hover effects and click animations for buttons, navigation items, and data points within charts, providing visual feedback and enhancing responsiveness.