import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/* PROTECT ROUTE MIDDLEWARE - Verifies JWT token and attaches user to request object */

const protectRoute = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ 
                error: "Unauthorized - No token provided" 
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: "Unauthorized - Token expired" 
                });
            }
            return res.status(401).json({ 
                error: "Unauthorized - Invalid token" 
            });
        }
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ 
                error: "Unauthorized - Invalid token payload" 
            });
        }

        // Find user (exclude password)
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }

        // Attach user to request
        req.user = user;
        
        next();

    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        res.status(500).json({ 
            error: "Internal Server Error" 
        });
    }
};
export default protectRoute;