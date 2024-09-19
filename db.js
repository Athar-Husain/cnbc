// const mongoose = require("mongoose");

// mongoose.set("strictQuery", true);

// const ConnectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI);
//     console.log(`MongoDb Connected ${conn.connection.host}`);
//   } catch (error) {
//     console.log(`Error : ${error.message}`);
//     process.exit(1);
//   }
// };
// // mongodb://localhost:27017/pvigil

// module.exports = ConnectDB;

import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Export the ConnectDB function
export default ConnectDB;
