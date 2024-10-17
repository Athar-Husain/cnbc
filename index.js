// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const ConnectDB = require("./db");
// const cookieParser = require("cookie-parser");
// const bodyParser = require("body-parser");
// const errorHandler = require("./middlewares/errorMiddleware");
// const userRoute = require("./routes/userRoute");

// ConnectDB();

// const app = express();
// const PORT = process.env.MY_PORT || 8000;

// // ============  Middle Wares ==============
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(cookieParser());
// app.use(bodyParser.json());

// app.use(
//   cors({
//     origin: [
//       process.env.FRONTEND_URL,
//       "http://localhost:3000",
//       "http://localhost:3001",
//     ],
//     credentials: true,
//   })
// );

// app.use("/api/users", userRoute);

// app.get("/", (req, res) => {
//   res.send("<h1>This is from Server/index.js</h1>");
// });

// app.use(errorHandler);

// app.listen(PORT, () => {
//   console.log(`Server is Started at PORT ${PORT}`);
// });

import "dotenv/config";
import express from "express";
import cors from "cors";
import ConnectDB from "./db.js"; // Ensure you include .js if using ES Modules
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import errorHandler from "./middlewares/errorMiddleware.js"; // Ensure you include .js
import userRoute from "./routes/userRoute.js"; // Ensure you include .js
import chatBotRoute from "./routes/chatBotRoute.js";

// Configure dotenv
// dotenv.config();

ConnectDB();

const app = express();
const PORT = process.env.MY_PORT || 8000;

// console.log("port clg", process.env.MY_PORT);

// ============  Middle Wares ==============
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL,
      // "http://localhost:3000",
      // "http://localhost:3001",
    ],
    credentials: true,
  })
);

app.use("/api/users", userRoute);
app.use("/api/chat", chatBotRoute);

app.get("/", (req, res) => {
  res.send("<h1>This is from Server/index.js</h1>");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is started at PORT ${PORT}`);
});
