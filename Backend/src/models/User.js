// // POSTGRESQL MODEL ---->>>>>>

// import { pool } from '../config/db.js';
// import bcrypt from 'bcrypt';

// class User {
//   static async create(userData) {
//     const { name, email, password, role, phone, isActive } = userData;
//     const hashedPassword = await bcrypt.hash(password, 12);

//     const query = `
//       INSERT INTO users (name, email, password, role, phone, is_active)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *;
//     `;
//     const values = [name, email.toLowerCase(), hashedPassword, role || 'field_inspector', phone || null, isActive !== undefined ? isActive : true];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   }

//   static async findByEmail(email) {
//     const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1;`, [email.toLowerCase()]);
//     return rows[0];
//   }

//   static async findById(id) {
//     const { rows } = await pool.query(`SELECT * FROM users WHERE id = $1;`, [id]);
//     return rows[0];
//   }

//   static async findAll() {
//     const { rows } = await pool.query(`SELECT id, name, email, role, phone, is_active, created_at, updated_at FROM users ORDER BY created_at DESC;`);
//     return rows;
//   }
  
//   static async countAll() {
//     const { rows } = await pool.query(`SELECT COUNT(*) as count FROM users;`);
//     return parseInt(rows[0].count);
//   }
  
// static async comparePassword(candidatePassword, hashedPassword) {
//   return await bcrypt.compare(candidatePassword, hashedPassword);
// }

//  static toJSON(user) {
//   if (!user) return null;
//   const { password, ...userWithoutPassword }= user;
//   userWithoutPassword._id = user.id; // Compatibility mapping for old references
//   return userWithoutPassword;
//  }
//  }
//   export default user;




// SEQUELIZE ORM MODEL ---->>>>>

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('email',
        value.toLowerCase()
      );
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active', //Maps to the snake_case column in the database
  }
},
{
  tableName: 'users',
  timestamps: true,   //automatically manages created_at and updated_At
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // Hash password before saving to the database
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
}
);

// Instance method to compare passwords
User.prototype.comparePassword = async function (candidatePassword) {
  return await
  bcrypt.compare(candidatePassword,
    this.password  );
};

//Override to JSON to hide the password and map the _id
User.prototype.toJSON = function()
{
  const values = Object.assign({},
    this.get());
    delete values.password;
    values._id = values.id; //Compatibility mapping for old references
    return values;
};

export default User;