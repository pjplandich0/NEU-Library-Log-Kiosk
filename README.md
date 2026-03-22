
# NEU Library Management System

This is the official Library Management System for New Era University, featuring kiosk-based visitor tracking and an administrative dashboard.

## 🖼️ Branding & Logo
To update the logo across the entire application:
1. Open the file: `src/app/lib/placeholder-images.json`
2. Replace the `imageUrl` value with your new logo link.
3. The change will automatically reflect on the Entrance, Exit, and Admin pages.

---

## 🚀 Deployment & Configuration Guide

If your Google SSO is failing with "Auth Failed" or you see a `no-options` error on Vercel, you **MUST** follow these steps:

### 1. Add Environment Variables in Vercel
Go to your **Vercel Project Settings > Environment Variables** and add these keys.

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-3354134181-ec43e` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:487381118557:web:d9b9aa6deacf63f09f67b4` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyC9NJ0SFe7bXHWb_zugrJ3MwjyiqnIA7xg` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-3354134181-ec43e.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `487381118557` |

### 2. Authorize your Vercel Domain in Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **studio-3354134181-ec43e**.
3. Go to **Authentication** > **Settings** (tab) > **Authorized Domains**.
4. Click **Add Domain** and enter your Vercel URL (e.g., `your-project-name.vercel.app`).
5. **CRITICAL**: Do not include `https://` in the domain field.

### 3. Change "studio-3354134181..." to "NEU Library" in Google Popup
To change the name shown in the Google Login window:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click the **Gear Icon** (Settings) in the top left sidebar and select **Project Settings**.
3. Under the **General** tab, locate the **Public-facing name** field.
4. Click the **Edit** (pencil) icon.
5. Change the name to **NEU Library** and click **Save**.
6. *Note: It may take a few minutes for Google to update the display name across its servers.*

---

## 📂 Project Structure for GitHub
When you download this project as a ZIP, upload everything **except** `node_modules`.

### Key Folders & Files:
- `src/`: All application source code (Logic, UI, Styles).
- `public/`: Static assets.
- `package.json`: Project dependencies.
- `firestore.rules`: Database security rules.
- `.gitignore`: Automatically tells GitHub to ignore `node_modules`.

## Key Features
- **Branding**: Official NEU Library Seal and Branding.
- **Kiosk Logic**: Seamless check-in/out for students and professors.
- **Admin Dashboard**: Real-time analytics with PDF export capabilities.
- **Real-time Profiles**: Displays user photos on welcome/goodbye screens and admin logs.
