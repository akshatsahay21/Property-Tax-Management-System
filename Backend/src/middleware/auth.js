// import jwt from 'jsonwebtoken';
// import User from "../models/User.js";
// 
// const protect = async (req, res, next) => {
//     try {
//         let token;
// 
//         if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//             token = req.headers.authorization.split(' ')[1];
//         }
// 
//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Access denied. No token provided.',
//             });
//         }
// 
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
// 
//         const user = await User.findById(decoded.id);
// 
//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Token is invalid. User not found.',
//             });
//         }
// 
//         if (!user.is_active) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Your account has been deactivated.',
//             });
//         }
// 
//         req.user = User.toJSON(user);
//         next();
// 
//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: 'token is invalid or expired.',
//         });
//     }
// };
// 
// export default protect;

// === SEQUELIZE ORM UPDATE ===

import jwt from 'jsonwebtoken';
import User from "../models/User.js";

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Sequelize replacement for findById()
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid. User not found.',
            });
        }

        if (!user.isActive) { // In Sequelize we mapped is_active to isActive
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated.',
            });
        }

        // We use the overridden toJSON() method attached to the user instance
        req.user = user.toJSON(); 
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'token is invalid or expired.',
        });
    }
};

export default protect;