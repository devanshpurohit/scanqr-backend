import mongoose from 'mongoose';

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ Connected to MongoDB`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        throw error;
    }
};

export default connectDB;
