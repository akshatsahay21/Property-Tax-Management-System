// import fs from 'fs'
// import path from 'path';
// import Entry from '../models/Entry.js';
// 
// export const createEntry = async (req, res) => {
//   try {
//     const { fullName, mobileNumber, address, description } = req.body;
//     
//     const entryData = {
//       inspector: req.user.id || req.user._id, 
//       fullName,
//       mobileNumber,
//       address,
//       description,
//       image: req.file ? `/uploads/${req.file.filename}` : null
//     };
// 
//     let entry = await Entry.create(entryData);
//     entry = Entry.formatWithInspector(entry);
// 
//     res.status(201).json({ success: true, entry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const getMyEntries = async (req, res) => {
//   try {
//     const inspectorId = req.user.id || req.user._id;
//     let entries = await Entry.findByInspector(inspectorId);
//     entries = entries.map(Entry.formatWithInspector);
//     
//     const counts = {
//       submitted: entries.filter(e => e.status === 'submitted').length,
//       approved: entries.filter(e => e.status === 'approved').length,
//       draft: entries.filter(e => e.status === 'draft').length
//     };
// 
//     res.status(200).json({ success: true, counts, entries });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 
// export const updateRejectedEntry = async (req, res) => {
//   try {
//     const { entryId } = req.params;
//     const { fullName, mobileNumber, address, description } = req.body;
//     const inspectorId = req.user.id || req.user._id;
// 
//     let entry = await Entry.findByIdAndInspector(entryId, inspectorId);
//     
//     if (!entry) {
//       return res.status(404).json({ success: false, message: 'Entry not found' });
//     }
// 
//     if (entry.status !== 'draft') {
//       return res.status(400).json({ success: false, message: 'Can only update draft entries' });
//     }
// 
//     const updateData = {
//       status: 'submitted',
//       rejection_reason: null,
//       reviewed_by: null,
//       reviewed_at: null
//     };
// 
//     if (fullName) updateData.full_name = fullName;
//     if (mobileNumber) updateData.mobile_number = mobileNumber;
//     if (address) updateData.address = address;
//     if (description) updateData.description = description;
//     
//     if (req.file) {
//       if (entry.image) {
//         const oldImagePath = path.join(process.cwd(), entry.image);
//         fs.unlink(oldImagePath, (err) => {
//           if (err && err.code !== 'ENOENT') {
//             console.error('Failed to delete old image:', err.message);
//           }
//         });
//       }
//       updateData.image = `/uploads/${req.file.filename}`;
//     }
// 
//     entry = await Entry.update(entry.id || entry._id, updateData);
//     entry = Entry.formatWithInspector(entry);
// 
//     res.status(200).json({ success: true, message: 'Entry resubmitted successfully', entry });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// 

// === SEQUELIZE ORM UPDATE ===

import fs from 'fs'
import path from 'path';
import Entry from '../models/Entry.js';
import User from '../models/User.js';

export const createEntry = async (req, res) => {
  try {
    const { fullName, mobileNumber, address, description } = req.body;
    
    const entryData = {
      inspectorId: req.user.id || req.user._id, 
      fullName,
      mobileNumber,
      address,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };

    let entry = await Entry.create(entryData);
    
    // Automatically JOIN the inspector details back onto the entry object
    await entry.reload({ include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }] });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyEntries = async (req, res) => {
  try {
    const inspectorId = req.user.id || req.user._id;
    
    // Sequelize replacement for findByInspector()
    const entries = await Entry.findAll({
      where: { inspectorId },
      include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }],
      order: [['created_at', 'DESC']]
    });
    
    const counts = {
      submitted: entries.filter(e => e.status === 'submitted').length,
      approved: entries.filter(e => e.status === 'approved').length,
      draft: entries.filter(e => e.status === 'draft').length
    };

    res.status(200).json({ success: true, counts, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRejectedEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { fullName, mobileNumber, address, description } = req.body;
    const inspectorId = req.user.id || req.user._id;

    // Sequelize replacement for findByIdAndInspector()
    let entry = await Entry.findOne({ where: { id: entryId, inspectorId } });
    
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }

    if (entry.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only update draft entries' });
    }

    const updateData = {
      status: 'submitted',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null
    };

    if (fullName) updateData.fullName = fullName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address) updateData.address = address;
    if (description) updateData.description = description;
    
    if (req.file) {
      if (entry.image) {
        const oldImagePath = path.join(process.cwd(), entry.image);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old image:', err.message);
          }
        });
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await entry.update(updateData);
    await entry.reload({ include: [{ model: User, as: 'inspector', attributes: ['id', 'name', 'email', 'phone', 'role'] }] });

    res.status(200).json({ success: true, message: 'Entry resubmitted successfully', entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};