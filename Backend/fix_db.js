import { sequelize } from './src/config/db.js';

const fixDb = async () => {
  try {
    console.log('Running raw SQL to add updated_at columns safely...');
    
    // Add updated_at to users if it doesn't exist, using a default value so existing rows don't crash it
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
    
    // Just in case entries is missing it too
    await sequelize.query('ALTER TABLE entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');

    console.log('Columns added successfully!');
  } catch (err) {
    console.error('Failed to add columns:', err.message);
  } finally {
    process.exit();
  }
};

fixDb();
