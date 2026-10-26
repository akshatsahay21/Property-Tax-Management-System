// import Entry from '../models/Entry.js';
// 
// export const getPendingEntries = async (req, res) => {
//   try {
//     const entries = await Entry.findAllSubmittedWithInspector();
//     res.status(200).json({ success: true, entries });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const approveEntry = async (req, res) => {
//   try {
//     const { entryId } = req.params;
//     const reviewerId = req.user.id || req.user._id;
// 
//     let entry = await Entry.findById(entryId);
//     if (!entry) {
//       return res.status(404).json({ success: false, message: 'Entry not found' });
//     }
// 
//     if (entry.status !== 'submitted') {
//       return res.status(400).json({ success: false, message: 'Entry is already processed' });
//     }
// 
//     const updateData = {
//       status: 'approved',
//       reviewed_by: reviewerId,
//       reviewed_at: new Date()
//     };
// 
//     entry = await Entry.update(entry.id || entry._id, updateData);
//     entry = Entry.formatWithInspector(entry);
// 
//     res.status(200).json({ success: true, message: 'Entry approved', entry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const rejectEntry = async (req, res) => {
//   try {
//     const { entryId } = req.params;
//     const { rejectionReason } = req.body;
//     const reviewerId = req.user.id || req.user._id;
// 
//     if (!rejectionReason) {
//       return res.status(400).json({ success: false, message: 'Rejection reason is required' });
//     }
// 
//     let entry = await Entry.findById(entryId);
//     if (!entry) {
//       return res.status(404).json({ success: false, message: 'Entry not found' });
//     }
// 
//     if (entry.status !== 'submitted') {
//       return res.status(400).json({ success: false, message: 'Entry is already processed' });
//     }
// 
//     const updateData = {
//       status: 'draft',
//       rejection_reason: rejectionReason,
//       reviewed_by: reviewerId,
//       reviewed_at: new Date()
//     };
// 
//     entry = await Entry.update(entry.id || entry._id, updateData);
//     entry = Entry.formatWithInspector(entry);
// 
//     res.status(200).json({ success: true, message: 'Entry rejected', entry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const getRejectedDrafts = async (req, res) => {
//   try {
//     const reviewerId = req.user.id || req.user._id;
//     const entries = await Entry.findAllRejectedBy(reviewerId);
//     res.status(200).json({ success: true, entries });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 

// === SEQUELIZE ORM UPDATE ===

import Entry from '../models/Entry.js';
import User from '../models/User.js'; // Added User for include relationships

export const getPendingEntries = async (req, res) => {
  try {
    // Sequelize replacement for findAllSubmittedWithInspector()
    const entries = await Entry.findAll({
      where: { status: 'submitted' },
      include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }],
      order: [['created_at', 'ASC']]
    });
    res.status(200).json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const reviewerId = req.user.id || req.user._id;

    // Sequelize replacement for findById()
    let entry = await Entry.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Entry is already processed' });
    }

    // Sequelize update
    await entry.update({
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });
    
    // Reload with relationship to format correctly
    await entry.reload({ include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }] });

    res.status(200).json({ success: true, message: 'Entry approved', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { rejectionReason } = req.body;
    const reviewerId = req.user.id || req.user._id;

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    let entry = await Entry.findByPk(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Entry is already processed' });
    }

    await entry.update({
      status: 'draft',
      rejectionReason: rejectionReason,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    });

    await entry.reload({ include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }] });

    res.status(200).json({ success: true, message: 'Entry rejected', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRejectedDrafts = async (req, res) => {
  try {
    const reviewerId = req.user.id || req.user._id;
    // Sequelize replacement for findAllRejectedBy()
    const entries = await Entry.findAll({
      where: { status: 'draft', reviewedBy: reviewerId },
      include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }],
      order: [['updated_at', 'DESC']]
    });
    res.status(200).json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};