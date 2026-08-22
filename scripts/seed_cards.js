import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.model.js';
import BusinessCard from '../models/BusinessCard.model.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const TARGET_EMAIL = process.argv[2] || 'test@gmail.com'; // Change this or pass as arg

const dummyCards = [
    {
        name: 'John Doe',
        company: 'Tech Solutions Inc.',
        position: 'Senior Developer',
        email: 'john.doe@techsolutions.com',
        phone: ['+1-555-0123'],
        address: '123 Tech Park, Silicon Valley, CA',
        website: 'https://techsolutions.com',
        imageUrl: '/uploads/dummy_card_1.jpg', // Placeholder
        notes: 'Met at React Native Conference',
        tags: ['Tech', 'Developer'],
    },
    {
        name: 'Sarah Smith',
        company: 'Creative Design Studio',
        position: 'Art Director',
        email: 'sarah@creativedesign.com',
        phone: ['+44-20-7123-4567'],
        address: '45 Design Avenue, London, UK',
        website: 'https://creativedesign.com',
        imageUrl: '/uploads/dummy_card_2.jpg',
        notes: 'Interested in rebranding project',
        tags: ['Design', 'Client'],
    },
    {
        name: 'Michael Chen',
        company: 'Global Finance Corp',
        position: 'Investment Analyst',
        email: 'm.chen@globalfinance.com',
        phone: ['+86-10-8888-8888', '+86-139-0000-0000'],
        address: '88 Finance Street, Beijing, China',
        website: 'https://globalfinance.com',
        imageUrl: '/uploads/dummy_card_3.jpg',
        tags: ['Finance'],
    },
    {
        name: 'Emma Wilson',
        company: 'StartUp Hub',
        position: 'Community Manager',
        email: 'emma@startuphub.io',
        phone: ['+1-415-555-9876'],
        address: '777 Startup Way, San Francisco, CA',
        website: 'https://startuphub.io',
        imageUrl: '/uploads/dummy_card_4.jpg',
        notes: 'Follow up for partnership',
        tags: ['Startup', 'Community'],
        isFavorite: true
    },
    {
        name: 'David Brown',
        company: 'Legal Partners LLP',
        position: 'Attorney',
        email: 'dbrown@legalpartners.com',
        phone: ['+1-212-555-4321'],
        address: '500 5th Ave, New York, NY',
        website: 'https://legalpartners.com',
        imageUrl: '/uploads/dummy_card_5.jpg',
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: TARGET_EMAIL });

        if (!user) {
            console.error(`❌ User with email ${TARGET_EMAIL} not found!`);
            console.log('Available users:');
            const users = await User.find({}, 'email');
            users.forEach(u => console.log(`- ${u.email}`));
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);

        const cardsToInsert = dummyCards.map(card => ({
            ...card,
            userId: user._id,
            isGoogleSynced: false,
            ocrConfidence: 95
        }));

        const result = await BusinessCard.insertMany(cardsToInsert);
        console.log(`✅ Successfully inserted ${result.length} dummy cards for ${user.email}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedData();
