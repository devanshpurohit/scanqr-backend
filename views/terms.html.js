export const termsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service | Scan2Lead</title>
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
            border-left: 4px solid #818cf8;
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
        a {
            color: #38bdf8;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Scan2Lead</div>
        <h1>Terms of Service</h1>
        <div class="subtitle">Last Updated: May 27, 2026</div>

        <div class="content">
            <p>Welcome to Scan2Lead. By downloading, installing, accessing, or using our mobile application or any related web services (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). Please read them carefully before using the Service.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By creating an account or accessing any part of the Service, you confirm that you are at least 16 years old and agree to comply with and be legally bound by these Terms. If you do not agree, please do not use the Service.</p>

            <h2>2. Description of Service</h2>
            <p>Scan2Lead is an AI-powered Business Card Scanner and contact management application. The Service allows users to:</p>
            <ul>
                <li>Scan physical business cards and extract contact information using Optical Character Recognition (OCR).</li>
                <li>Store and manage scanned business cards in a personal digital wallet.</li>
                <li>Sync extracted contact data to the user's Google Contacts account.</li>
                <li>Search, edit, and delete stored business card records.</li>
            </ul>

            <h2>3. User Accounts</h2>
            <p>To use the Service, you must register for an account using your email address or Google OAuth. You are responsible for:</p>
            <ul>
                <li>Maintaining the confidentiality and security of your login credentials.</li>
                <li>All activity that occurs under your account.</li>
                <li>Notifying us immediately of any unauthorized use of your account at <a href="mailto:support@metaaidevelopment.com">support@metaaidevelopment.com</a>.</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>

            <h2>4. Acceptable Use</h2>
            <p>You agree to use the Service only for lawful purposes. You must not:</p>
            <ul>
                <li>Use the Service to collect contact information from others without their explicit consent.</li>
                <li>Attempt to gain unauthorized access to any part of the Service, server, or network.</li>
                <li>Upload any illegal, defamatory, or infringing content.</li>
                <li>Use the Service to send unsolicited commercial messages (spam).</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
                <li>Overload, disable, or impair the Service through excessive usage.</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>The Scan2Lead name, logo, and all related software, features, and technology are the exclusive intellectual property of MetaAI Development and its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to use the mobile application strictly for personal, non-commercial use.</p>

            <h2>6. Third-Party Services</h2>
            <p>The Service integrates with third-party platforms including Google OAuth and Google Contacts API. Your use of those platforms is governed by their respective Terms of Service and Privacy Policies. We are not responsible for the actions of any third-party service providers.</p>

            <h2>7. Data and Privacy</h2>
            <p>Your use of the Service is also governed by our <a href="/privacy">Privacy Policy</a>, which is incorporated into these Terms by reference. By using the Service, you consent to the data practices described therein.</p>

            <h2>8. Account Termination & Data Deletion</h2>
            <p>You may delete your account and all associated data at any time through the in-app settings or by visiting our <a href="/delete-account">account deletion page</a>. Upon deletion, your account, profile, scanned card images, and all stored data are permanently and irrecoverably erased from our systems.</p>
            <p>We reserve the right to terminate accounts that violate these Terms, with or without prior notice.</p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>The Service is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or entirely accurate in its OCR extraction results.</p>

            <h2>10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, Scan2Lead and MetaAI Development shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service.</p>

            <h2>11. Changes to Terms</h2>
            <p>We reserve the right to update or modify these Terms at any time. We will notify you of significant changes by posting the revised Terms on this page and updating the "Last Updated" date. Continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>Email: <a href="mailto:support@metaaidevelopment.com">support@metaaidevelopment.com</a></p>
        </div>

        <div class="footer">
            &copy; 2026 Scan2Lead. All rights reserved. | <a href="/privacy">Privacy Policy</a>
        </div>
    </div>
</body>
</html>`;
