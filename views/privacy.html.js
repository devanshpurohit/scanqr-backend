export const privacyHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy | Scan2Lead</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }
        body {
            background: radial-gradient(circle at top right, #1e1b4b, #0f172a 60%);
            color: #f8fafc;
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 800px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .logo {
            text-align: center;
            font-weight: 700;
            font-size: 1.8rem;
            margin-bottom: 24px;
            background: linear-gradient(135deg, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 8px;
            text-align: center;
            color: #ffffff;
        }
        .subtitle {
            font-size: 0.95rem;
            color: #64748b;
            text-align: center;
            margin-bottom: 40px;
        }
        .content {
            color: #cbd5e1;
            line-height: 1.7;
            font-size: 0.95rem;
        }
        h2 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #ffffff;
            margin-top: 32px;
            margin-bottom: 12px;
            border-left: 4px solid #38bdf8;
            padding-left: 12px;
        }
        p {
            margin-bottom: 16px;
        }
        ul {
            margin-bottom: 16px;
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.85rem;
            color: #64748b;
        }
        .footer a {
            color: #38bdf8;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Scan2Lead</div>
        <h1>Privacy Policy</h1>
        <div class="subtitle">Last Updated: May 27, 2026</div>
        
        <div class="content">
            <p>Welcome to Scan2Lead ("we", "our", or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and backend services.</p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information to provide a better scanning and contact-management experience for our users:</p>
            <ul>
                <li><strong>Account Information:</strong> When you register an account, we collect your name, email address, and a hashed password (if signing up via email). If registering via Google OAuth, we collect your basic profile details (name, email, profile picture) and authentication tokens.</li>
                <li><strong>Scanned Card Data:</strong> When you scan business cards using the app, our backend processes the card image via Optical Character Recognition (OCR) to extract contact details such as name, job title, company, phone number, email address, physical address, and website URLs.</li>
                <li><strong>Uploaded Images:</strong> The raw and processed business card images you capture or upload are stored securely in our storage system to display them in your card wallet.</li>
                <li><strong>Google Contacts Permissions:</strong> If you use our Google Contacts sync feature, the app requests access to read and write contacts in your Google Account. We use this scope solely to export scanned cards to your contact list.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
                <li>To create and manage your user account.</li>
                <li>To process and extract contact information from scanned business cards using AI OCR.</li>
                <li>To enable syncing and creation of contacts directly inside your Google Contacts list.</li>
                <li>To maintain your secure digital business card wallet.</li>
                <li>To offer settings management, account deactivation, and permanent data deletion.</li>
            </ul>

            <h2>3. Data Sharing & Disclosure</h2>
            <p><strong>We do not sell, rent, or trade your personal data or contact details with third parties under any circumstances.</strong> All data transmission occurs securely over encrypted HTTPS connections. Your Google Contacts API access tokens are stored securely and are only used for direct communication with the official Google APIs for contact syncing.</p>

            <h2>4. Data Retention & Deletion Rights</h2>
            <p>We retain your data for as long as your account is active. You have full control over your data:</p>
            <ul>
                <li><strong>In-App Deletion:</strong> You can permanently delete your account and all associated scanned card documents/images directly through the "Delete Account" button in the settings screen.</li>
                <li><strong>Web-Based Deletion:</strong> You can also request deletion at any time by visiting our online deletion portal at <a href="/delete-account" target="_blank">/delete-account</a>.</li>
                <li><strong>Immediate Destruction:</strong> Upon account deletion, your profile record, Google tokens, and all uploaded card images are immediately and permanently erased from our databases and storage.</li>
            </ul>

            <h2>5. Security of Your Data</h2>
            <p>We implement robust industry-standard technical and organizational security measures to protect your personal data from unauthorized access, modification, or disclosure. However, no electronic transmission over the internet or storage technology can be guaranteed 100% secure.</p>

            <h2>6. Changes to this Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>

            <h2>7. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
            <p>Email: <a href="mailto:support@metaaidevelopment.com">support@metaaidevelopment.com</a></p>
        </div>
        
        <div class="footer">
            &copy; 2026 Scan2Lead. All rights reserved. | <a href="/terms">Terms of Service</a>
        </div>
    </div>
</body>
</html>`;
