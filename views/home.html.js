export const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scan2Lead | AI-Powered Business Card Scanner</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.15);
            --secondary: #818cf8;
            --background: #0b0f19;
            --surface: rgba(22, 28, 45, 0.7);
            --border: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--background);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.6;
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(129, 140, 248, 0.1) 0%, transparent 40%);
        }

        /* Navbar */
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 8%;
            border-bottom: 1px solid var(--border);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(11, 15, 25, 0.8);
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .logo-icon {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.1rem;
            box-shadow: 0 4px 12px var(--primary-glow);
        }

        .logo-text {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1.5rem;
            background: linear-gradient(135deg, #fff, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links {
            display: flex;
            gap: 30px;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            font-size: 0.95rem;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        /* Hero Section */
        .hero {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 80px 8% 60px;
            max-width: 1000px;
            margin: 0 auto;
        }

        .badge {
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            color: #a5b4fc;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
            text-transform: uppercase;
        }

        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero p {
            color: var(--text-secondary);
            font-size: 1.15rem;
            max-width: 700px;
            margin-bottom: 40px;
        }

        .btn {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: #ffffff;
            padding: 14px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 1rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 24px var(--primary-glow);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(99, 102, 241, 0.3);
        }

        /* Features Section */
        .features {
            padding: 60px 8%;
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 48px;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }

        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 32px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
            border-color: rgba(99, 102, 241, 0.25);
        }

        .card-icon {
            width: 48px;
            height: 48px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 1.3rem;
            margin-bottom: 20px;
        }

        .card h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.3rem;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .card p {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.6;
        }

        /* Transparency & Data Safety Section */
        .data-safety {
            background: linear-gradient(180deg, transparent, rgba(99, 102, 241, 0.05), transparent);
            padding: 80px 8%;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
        }

        .safety-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .safety-row {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }

        .safety-block {
            display: flex;
            gap: 24px;
        }

        .safety-number {
            font-family: 'Outfit', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary);
            opacity: 0.8;
            line-height: 1;
        }

        .safety-content h3 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.4rem;
            margin-bottom: 10px;
            color: #ffffff;
        }

        .safety-content p {
            color: var(--text-secondary);
            font-size: 1rem;
            margin-bottom: 8px;
        }

        .safety-content ul {
            list-style: none;
            padding-left: 0;
            margin-top: 12px;
        }

        .safety-content li {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .safety-content li i {
            color: var(--primary);
            font-size: 0.85rem;
        }

        /* Footer */
        footer {
            padding: 48px 8% 30px;
            max-width: 1200px;
            margin: 0 auto;
            border-top: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .footer-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .footer-links {
            display: flex;
            gap: 24px;
            list-style: none;
        }

        .footer-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }

        .footer-links a:hover {
            color: var(--primary);
        }

        .footer-bottom {
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 2.5rem;
            }
            nav {
                padding: 20px 5%;
            }
            .nav-links {
                display: none;
            }
            .hero {
                padding: 60px 5% 40px;
            }
            .features {
                padding: 40px 5%;
            }
            .grid {
                grid-template-columns: 1fr;
            }
            .data-safety {
                padding: 60px 5%;
            }
            footer {
                padding: 40px 5% 20px;
            }
        }
    </style>
</head>
<body>

    <!-- Navigation -->
    <nav>
        <div class="logo-container">
            <div class="logo-icon">
                <i class="fa-solid fa-address-card"></i>
            </div>
            <div class="logo-text">Scan2Lead</div>
        </div>
        <ul class="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/delete-account">Delete Data</a></li>
        </ul>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
        <div class="badge">AI Business Card Scanner</div>
        <h1>Scan Business Cards in Seconds with Vision AI</h1>
        <p>Transform physical business cards into digital contacts instantly. Organize them in a premium secure wallet and sync directly with your Google Contacts database.</p>
        <a href="#features" class="btn">Explore Features <i class="fa-solid fa-arrow-down"></i></a>
    </header>

    <!-- Features Section -->
    <section class="features" id="features">
        <h2 class="section-title">Fully Featured Contact Wallet</h2>
        <div class="grid">
            <!-- Feature 1 -->
            <div class="card">
                <div class="card-icon"><i class="fa-solid fa-camera"></i></div>
                <h3>Optical Scan & Capture</h3>
                <p>Use your mobile phone's built-in camera to snap high-quality photos of business cards. Scan2Lead captures structural data instantly.</p>
            </div>
            <!-- Feature 2 -->
            <div class="card">
                <div class="card-icon"><i class="fa-solid fa-brain"></i></div>
                <h3>AI Information Extraction</h3>
                <p>Powered by advanced OpenAI Vision models to automatically read and parse names, phone numbers, email addresses, websites, companies, and roles.</p>
            </div>
            <!-- Feature 3 -->
            <div class="card">
                <div class="card-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <h3>Google Contacts Sync</h3>
                <p>Export scanned cards to your Google Contacts library with one tap. Access your cards on any device connected to your Gmail account.</p>
            </div>
        </div>
    </section>

    <!-- Privacy & Transparency Section -->
    <section class="data-safety" id="privacy">
        <div class="safety-container">
            <h2 class="section-title">Data Safety & OAuth Transparency</h2>
            <div class="safety-row">
                
                <div class="safety-block">
                    <div class="safety-number">01</div>
                    <div class="safety-content">
                        <h3>Accurate Brand Representation</h3>
                        <p><strong>Scan2Lead</strong> is a productivity tool created to optimize B2B contact collection. Our brand is dedicated to facilitating card digitization, eliminating manual typing errors, and keeping your professional network unified. We are operated by MetaAI Development.</p>
                    </div>
                </div>

                <div class="safety-block">
                    <div class="safety-number">02</div>
                    <div class="safety-content">
                        <h3>Purpose of Google OAuth</h3>
                        <p>We ask you to Sign in with Google to:</p>
                        <ul>
                            <li><i class="fa-solid fa-check"></i> Authenticate your profile securely without creating new passwords.</li>
                            <li><i class="fa-solid fa-check"></i> Connect your account with Google's Contacts API.</li>
                        </ul>
                    </div>
                </div>

                <div class="safety-block">
                    <div class="safety-number">03</div>
                    <div class="safety-content">
                        <h3>Transparent Use of Scopes & Data</h3>
                        <p>Scan2Lead requests the <strong>Google Contacts write scope</strong> (<code>https://www.googleapis.com/auth/contacts</code>) solely for the following purpose:</p>
                        <ul>
                            <li><i class="fa-solid fa-circle-info"></i> To create and save contact records derived from your scanned business cards into your Google Contacts list.</li>
                            <li><i class="fa-solid fa-circle-info"></i> We <strong>never</strong> download, read, modify, or delete your pre-existing Google contacts.</li>
                            <li><i class="fa-solid fa-circle-info"></i> We <strong>never</strong> share or sell your contact list with third parties. All processing happens securely between our server and your Google account.</li>
                        </ul>
                    </div>
                </div>

                <div class="safety-block">
                    <div class="safety-number">04</div>
                    <div class="safety-content">
                        <h3>Full Data Control & Deletion</h3>
                        <p>You have full ownership of your data. You can delete individual business cards from your local digital wallet at any time. If you decide to close your account, you can do so in-app or through our web-based <a href="/delete-account" style="color: var(--primary); text-decoration: underline;">Data Deletion Portal</a>, which permanently erases your user profile, card images, and scans from our database.</p>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-top">
            <div class="logo-container">
                <div class="logo-icon" style="width: 28px; height: 28px; font-size: 0.9rem;">
                    <i class="fa-solid fa-address-card"></i>
                </div>
                <div class="logo-text" style="font-size: 1.25rem;">Scan2Lead</div>
            </div>
            <ul class="footer-links">
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/delete-account">Delete Account</a></li>
                <li><a href="mailto:support@metaaidevelopment.com">Contact Support</a></li>
            </ul>
        </div>
        <div class="footer-bottom">
            &copy; 2026 Scan2Lead. All rights reserved. Managed by MetaAI Development.
        </div>
    </footer>

</body>
</html>`;
