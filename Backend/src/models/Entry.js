// import { pool } from '../config/db.js';
// 
// class Entry {
//   static async create(entryData) {
//     const { inspector, fullName, mobileNumber, address, description, image } = entryData;
//     const query = `
//       INSERT INTO entries (inspector_id, full_name, mobile_number, address, description, image, status)
//       VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
//       RETURNING *;
//     `;
//     const values = [inspector, fullName, mobileNumber, address, description, image || null];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   }
// 
//   static async findByInspector(inspectorId) {
//     const query = `SELECT * FROM entries WHERE inspector_id = $1 ORDER BY created_at DESC;`;
//     const { rows } = await pool.query(query, [inspectorId]);
//     return rows;
//   }
// 
//   static async findById(id) {
//     const query = `SELECT * FROM entries WHERE id = $1;`;
//     const { rows } = await pool.query(query, [id]);
//     return rows[0];
//   }
// 
//   static async findByIdAndInspector(id, inspectorId) {
//     const query = `SELECT * FROM entries WHERE id = $1 AND inspector_id = $2;`;
//     const { rows } = await pool.query(query, [id, inspectorId]);
//     return rows[0];
//   }
// 
//   static async update(id, updateData) {
//     const fields = [];
//     const values = [];
//     let idx = 1;
//     for (const [key, value] of Object.entries(updateData)) {
//       if (value !== undefined) {
//         fields.push(`${key} = $${idx}`);
//         values.push(value);
//         idx++;
//       }
//     }
//     if (fields.length === 0) return null;
//     fields.push(`updated_at = CURRENT_TIMESTAMP`);
//     values.push(id);
//     const query = `UPDATE entries SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *;`;
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   }
// 
//   static async findAllSubmittedWithInspector() {
//     const query = `
//       SELECT e.*, i.name as inspector_name, i.email as inspector_email, i.phone as inspector_phone
//       FROM entries e
//       JOIN users i ON e.inspector_id = i.id
//       WHERE e.status = 'submitted'
//       ORDER BY e.created_at ASC;
//     `;
//     const { rows } = await pool.query(query);
//     return rows.map(this.formatWithInspector);
//   }
// 
//   static async findAllRejectedBy(reviewerId) {
//     const query = `
//       SELECT e.*, i.name as inspector_name, i.email as inspector_email, i.phone as inspector_phone
//       FROM entries e
//       JOIN users i ON e.inspector_id = i.id
//       WHERE e.status = 'draft' AND e.reviewed_by = $1
//       ORDER BY e.updated_at DESC;
//     `;
//     const { rows } = await pool.query(query, [reviewerId]);
//     return rows.map(this.formatWithInspector);
//   }
// 
//   static async findAllWithRelations() {
//     const query = `
//       SELECT e.*, 
//              i.name as inspector_name, i.email as inspector_email, i.role as inspector_role,
//              r.name as reviewer_name, r.email as reviewer_email, r.role as reviewer_role
//       FROM entries e
//       LEFT JOIN users i ON e.inspector_id = i.id
//       LEFT JOIN users r ON e.reviewed_by = r.id
//       ORDER BY e.created_at DESC;
//     `;
//     const { rows } = await pool.query(query);
//     return rows.map(row => {
//       const entry = this.formatWithInspector(row);
//       if (row.reviewed_by) {
//         entry.reviewedBy = {
//           _id: row.reviewed_by,
//           name: row.reviewer_name,
//           email: row.reviewer_email,
//           role: row.reviewer_role
//         };
//       }
//       return entry;
//     });
//   }
// 
//   static async countAll() {
//     const { rows } = await pool.query(`SELECT COUNT(*) as count FROM entries;`);
//     return parseInt(rows[0].count);
//   }
// 
//   static async countByStatus(status) {
//     const { rows } = await pool.query(`SELECT COUNT(*) as count FROM entries WHERE status = $1;`, [status]);
//     return parseInt(rows[0].count);
//   }
// 
//   static formatWithInspector(row) {
//     if (!row) return null;
//     const entry = {
//       _id: row.id,
//       inspector: row.inspector_id,
//       fullName: row.full_name,
//       mobileNumber: row.mobile_number,
//       address: row.address,
//       description: row.description,
//       image: row.image,
//       status: row.status,
//       rejectionReason: row.rejection_reason,
//       reviewedBy: row.reviewed_by,
//       reviewedAt: row.reviewed_at,
//       createdAt: row.created_at,
//       updatedAt: row.updated_at
//     };
//     if (row.inspector_name) {
//       entry.inspector = {
//         _id: row.inspector_id,
//         name: row.inspector_name,
//         email: row.inspector_email,
//         phone: row.inspector_phone,
//         role: row.inspector_role
//       };
//     }
//     return entry;
//   }
// }
// 
// export default Entry;

// SEQUELIZE ORM MODEL ---->>>>>

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './User.js';

const Entry = sequelize.define('Entry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  inspectorId: {
    type: DataTypes.INTEGER,
    field: 'inspector_id',
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    field: 'full_name',
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    field: 'mobile_number',
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'submitted',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason',
    allowNull: true,
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    field: 'reviewed_by',
    allowNull: true,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    field: 'reviewed_at',
    allowNull: true,
  }
}, {
  tableName: 'entries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Define Relationships 
Entry.belongsTo(User, { foreignKey: 'inspectorId', as: 'inspector' });
User.hasMany(Entry, { foreignKey: 'inspectorId', as: 'entries' });

Entry.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
User.hasMany(Entry, { foreignKey: 'reviewedBy', as: 'reviewedEntries' });

Entry.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  values._id = values.id; // Compatibility mapping for frontend
  if (values.created_at) values.createdAt = values.created_at;
  if (values.updated_at) values.updatedAt = values.updated_at;
  return values;
};

export default Entry;
