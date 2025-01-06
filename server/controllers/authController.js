import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT token using the 'userId' keyword
        const token = jwt.sign(
            { userId: newUser._id }, // Ensure 'userId' is used here
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token valid for 1 day
        );

        // Send response with token and user data
        res.status(200).json({
            message: 'User registered and logged in successfully',
            token,
            user: {
                userId: newUser._id, // Ensure 'userId' is used here
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Error in user registration:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id }, // Use userId as the key here
            process.env.JWT_SECRET,
            { expiresIn: '30d' } // Token valid for 1 hour
        );

        // Send response with token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user._id, // Use userId as the key here
                name: user.name,
                email: user.email,
                role: user.role,

            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Controller to get user by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;  // Get the user ID from the URL parameter

    try {
        // Find the user by ID in the database
        const user = await User.findById(id);

        // If no user is found
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // If user is found, return the user data
        res.status(200).json({
            message: "User fetched successfully.",
            user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};