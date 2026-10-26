// MONGOOSE ->>>

// import mongoose from 'mongoose';
// const connectDb = async () => {
//     try {
//         const conn = await
//             mongoose.connect(process.env.MONGO_URI);
//         console.log(`MongoDb is working and connected: ${conn.connection.host}`);
//     }
//     catch (error) {
//         console.error(` MongoDb connection error: ${error.message}`);
//         process.exit(1);
//     }
// };

// export default connectDb;

// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// const connectDb = async () => {
//   try {
//     const client = await pool.connect();
//     console.log(`PostgreSQL is working and connected to: ${client.database}`);
//     client.release();
//   } catch (error) {
//     console.error(`PostgreSQL connection error: ${error.message}`);
//     process.exit(1);
//   }
// };

// export { pool };
// export default connectDb;/











// POSTGRESQL ->>>>>>

// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// config.dotenv();

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// const connectDb = async () => {
//   try {
//     const client = await pool.connect();
//     console.log(`PostgreSQL is working and connected to ${client.database}`);
//     client.release();

//   } catch (error) {
//     console.error(`PostgreSQL connection error: ${error.message}`);
//   }
// };

// export { pool }
// export default connectDb;





// SEQUELIZE ORM ---->>>>>

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false,
  }
);

const connectDb = async () => {
  try {
    // Synchronize models with database (creates tables/columns if they don't exist)
    await sequelize.sync({ alter: true }); 
    console.log('Sequelize ORM is working and connected to PostgreAQL');
  } catch (error) {
    console.error(`Sequelize connection error:
      ${error.message}`);
  }
};

export { sequelize };
export default connectDb;