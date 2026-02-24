import User from '../models/user.model.js';
import Contact from '../models/contacts.model.js';
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from '../utils/generateToken.js';
/* SIGNUP CONTROLLER*/
export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password, confirmPassword, gender, language } = req.body;
        // Basic field validation
        if (!fullName || !username || !email || !password || !confirmPassword || !gender) {
            return res.status(400).json({ error: "All required fields must be filled." });
        }

        // Password match check
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords don't match." });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        // DOMAIN RESTRICTION CHECK
        const allowedDomains = process.env.ALLOWED_DOMAINS?.split(",").map(d => d.trim().toLowerCase()) || [];
        const emailDomain = email.split("@")[1]?.toLowerCase();

        if (!emailDomain || !allowedDomains.includes(emailDomain)) {
            return res.status(403).json({
                error: "Only official organization emails are allowed."
            });
        }

        // This works with the case-insensitive index we created
        const existingUser = await User.findOne({ 
            username: username 
        }).collation({ locale: 'en', strength: 2 });

        if (existingUser) {
            return res.status(400).json({ error: "Username already exists." });
        }

        // Check email uniqueness with collation
        const existingEmail = await User.findOne({ 
            email: email.toLowerCase() 
        });

        if (existingEmail) {
            return res.status(400).json({ error: "Email is already registered." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default profile pictures
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Create new user
        const newUser = new User({
            fullName,
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            gender,
            language: language || "en",
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic
        });

        await newUser.save();

        // Create contact list
        const newContactList = new Contact({
            user: newUser._id,
            contacts: []
        });

        await newContactList.save();

        // Generate JWT + Cookie
        generateTokenAndSetCookie(newUser._id, res);

        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            email: newUser.email,
            profilePic: newUser.profilePic,
            language: newUser.language,
            message: "Successfully signed up"
        });

    } catch (error) {
        console.error("Error in signup controller:", error);
        
        // Handle duplicate key errors specifically
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` 
            });
        }
        
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/* LOGIN CONTROLLER */

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // Use collation for case-insensitive search
        const user = await User.findOne({ 
            username: username 
        }).collation({ locale: 'en', strength: 2 });

        if (!user) {
            return res.status(400).json({ error: "Incorrect username or password." });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Incorrect username or password." });
        }

        // DOMAIN CHECK AGAIN (SECURITY LAYER)
        const allowedDomains = process.env.ALLOWED_DOMAINS?.split(",").map(d => d.trim().toLowerCase()) || [];
        const emailDomain = user.email.split("@")[1]?.toLowerCase();

        if (!allowedDomains.includes(emailDomain)) {
            return res.status(403).json({
                error: "Unauthorized organization email."
            });
        }

        // Ensure contact list exists
        let contactList = await Contact.findOne({ user: user._id });

        if (!contactList) {
            contactList = new Contact({
                user: user._id,
                contacts: []
            });
            await contactList.save();
        }

        // Generate JWT
        generateTokenAndSetCookie(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            language: user.language,
            message: "Login successful"
        });

    } catch (error) {
        console.error("Error in login controller:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/* LOGOUT CONTROLLER */

export const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });

        return res.status(200).json({ message: "Logged Out Successfully" });

    } catch (error) {
        console.error("Error in logout controller:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};