// import User from '../models/User.js';
// import { generateToken } from '../utils/generateToken.js';
// 
// export const register = async (req, res) => {
//   try {
//     const { name, email, password, phone, role } = req.body;
//     
//     const userExists = await User.findByEmail(email);
//     if (userExists) {
//       return res.status(400).json({ success: false, message: 'User already exists' });
//     }
// 
//     const user = await User.create({
//       name,
//       email,
//       password,
//       phone,
//       role: role || 'field_inspector'
//     });
// 
//     res.status(201).json({
//       success: true,
//       user: User.toJSON(user),
//       token: generateToken({ id: user.id, role: user.role })
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
// 
//     const user = await User.findByEmail(email);
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
// 
//     const isMatch = await User.comparePassword(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
// 
//     res.status(200).json({
//       success: true,
//       user: User.toJSON(user),
//       token: generateToken({ id: user.id, role: user.role })
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 

// === SEQUELIZE ORM UPDATE ===

import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Find by email using Sequelize
    const userExists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user (password hashing is automatically handled by the Sequelize hook)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'field_inspector'
    });

    res.status(201).json({
      success: true,
      user: user, // Express automatically calls user.toJSON() which we overrode in the model
      token: generateToken({ id: user.id, role: user.role })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password using the instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      user: user, // Express automatically calls user.toJSON()
      token: generateToken({ id: user.id, role: user.role })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};