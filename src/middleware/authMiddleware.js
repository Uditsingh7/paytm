const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config');


const verifyToken = (req, res, next) => {
    try {
        // Get token from header if it exists. 
        // If not, return a 401 forbidden error and end the middleware execution chain
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        message: "Token has expired"
                    });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({
                        message: "Token is not valid"
                    });
                }
                return res.status(500).json({
                    message: "Internal server error"
                });
            }
            req.userId = user.userId;
            next();
        });
    }
    catch (error) {
        console.log("Error in Verify Token Middleware", error);
        res.status(500).json({
            success: false,
            message: error?.message || ""
        })
    }
}

module.exports = {
    verifyToken
}