// import Entry from '../models/Entry.js';
// import User from '../models/User.js';
// 
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.findAll();
//     res.status(200).json({ success: true, users: users.map(User.toJSON) });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const getAllEntries = async (req, res) => {
//   try {
//     const entries = await Entry.findAllWithRelations();
//     res.status(200).json({ success: true, entries });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const getDashboardStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countAll();
//     const totalEntries = await Entry.countAll();
//     const pendingEntries = await Entry.countByStatus('submitted');
//     const approvedEntries = await Entry.countByStatus('approved');
//     const rejectedEntries = await Entry.countByStatus('draft'); 
// 
//     res.status(200).json({
//       success: true,
//       stats: {
//         totalUsers,
//         totalEntries,
//         pendingEntries,
//         approvedEntries,
//         rejectedEntries
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 

// === SEQUELIZE ORM UPDATE ===

import Entry from '../models/Entry.js';
import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    // Express automatically formats this using the overriden toJSON() on the User model
    res.status(200).json({ success: true, users: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllEntries = async (req, res) => {
  try {
    // Sequelize replacement for findAllWithRelations(), automatically handles JOINs
    const entries = await Entry.findAll({
      include: [
        { model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] },
        { model: User, as: 'reviewer', attributes: ['id', 'name', 'email', 'phone', 'role'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.status(200).json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Sequelize replacements for count()
    const totalUsers = await User.count();
    const totalEntries = await Entry.count();
    const pendingEntries = await Entry.count({ where: { status: 'submitted' } });
    const approvedEntries = await Entry.count({ where: { status: 'approved' } });
    const rejectedEntries = await Entry.count({ where: { status: 'draft' } }); 

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalEntries,
        pendingEntries,
        approvedEntries,
        rejectedEntries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};