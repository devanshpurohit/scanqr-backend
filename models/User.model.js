import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId; // Password required only if not using Google OAuth
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    googleAccessToken: String,
    googleRefreshToken: String,
    profilePicture: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.googleAccessToken;
    delete obj.googleRefreshToken;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
