import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.routes.js';
import businessCardRoutes from './routes/businessCard.routes.js';
import googleContactsRoutes from './routes/googleContacts.routes.js';
import adminRoutes from './routes/admin.routes.js';
import scanRoutes from './routes/scan.routes.js';
import connectDB from './config/db.js';
import { privacyHtml } from './views/privacy.html.js';
import { termsHtml } from './views/terms.html.js';
import { homeHtml } from './views/home.html.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection Middleware (Optimized for Serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.FRONTEND_URL, // new mobile-first scanner frontend (production)
    'http://localhost:5173',
    'http://localhost:5174',
    'https://bussiness-card-admin-flame.vercel.app',
    'https://businesscard.metaaidevelopment.com',
    'https://adminbusinesscard.metaaidevelopment.com'
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('CORS policy does not allow access from this origin'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));



app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', businessCardRoutes);
app.use('/api/google', googleContactsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scan', scanRoutes);

// Landing/Homepage
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(homeHtml);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Privacy Policy Page
app.get('/privacy', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(privacyHtml);
});

// Terms of Service Page
app.get('/terms', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(termsHtml);
});

// Delete Account Web Page (Play Store Data Safety requirement)
app.get('/delete-account', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Account & Data | Scan2Lead</title>
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
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: rgba(30, 41, 59, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 600px;
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
            font-size: 1.7rem;
            font-weight: 700;
            margin-bottom: 14px;
            text-align: center;
            color: #ffffff;
        }
        .description {
            color: #cbd5e1;
            font-size: 1rem;
            line-height: 1.8;
            text-align: center;
            margin-bottom: 28px;
        }
        .steps {
            list-style: none;
            padding-left: 0;
            margin-bottom: 28px;
        }
        .steps li {
            position: relative;
            padding: 16px 20px 16px 62px;
            margin-bottom: 16px;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            color: #e2e8f0;
            line-height: 1.6;
        }
        .steps li::before {
            content: counter(step);
            counter-increment: step;
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: linear-gradient(135deg, #38bdf8, #818cf8);
            color: #0f172a;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
        }
        .steps {
            counter-reset: step;
        }
        .note {
            font-size: 0.92rem;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        .support-info {
            font-size: 0.95rem;
            color: #cbd5e1;
            text-align: center;
            line-height: 1.7;
        }
        .support-info a {
            color: #38bdf8;
            text-decoration: none;
        }
        .support-info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Scan2Lead</div>
        <h1>How to Delete Your Account</h1>
        <p class="description">To delete your account from the app, follow the steps below. Your personal profile, scanned cards, images, and synced data will be removed permanently.</p>

        <ul class="steps">
            <li>Open the Scan2Lead app and sign in with your account.</li>
            <li>Navigate to the <strong>Settings</strong> or <strong>Profile</strong> section.</li>
            <li>Find and tap the <strong>Delete Account</strong> option.</li>
            <li>Review the confirmation message and confirm that you want to permanently delete your account.</li>
            <li>Complete any verification prompts if requested, then confirm the deletion.</li>
        </ul>

        <p class="note"><strong>Note:</strong> Once deleted, your account and all associated scanned business cards, payment information, preferences, and profile data cannot be recovered.</p>

        <div class="support-info">
            If you need help, please contact us at <a href="mailto:support@metaaidevelopment.com">support@metaaidevelopment.com</a> and provide your registered email address.
        </div>
    </div>
</body>
</html>`);
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Only listen locally, Vercel will handle serving
if (!process.env.VERCEL) {
    app.listen(PORT, async () => {
        await connectDB();
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

export default app;
