// const express = require("express");
// const router = express.Router();

// // const {
// //   protect,
// //   // adminOnly,
// //   // authorOnly,
// // } = require("../middleware/authMIddleware");
// const { protect } = require("../middlewares/authMiddleware");

// const {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getUser,
//   updateUser,
//   deleteUser,
//   loginStatus,
//   // upgradeUser,
//   sendAutomatedEmail,
//   sendVerificationEmail,
//   verifyUser,
//   forgotPassword,
//   resetPassword,
//   changePassword,
//   sendLoginCode,
//   loginWithCode,
//   // loginWithGoogle,
//   getUsers,
// } = require("../controllers/userController");

// // for user

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.get("/logout", logoutUser);
// router.get("/getUser", protect, getUser);
// router.patch("/updateUser", protect, updateUser);

// // admin routers
// // router.delete("/:id", protect, adminOnly, deleteUser);
// router.get("/getUsers", /* protect, authorOnly, */ getUsers);
// router.get("/loginStatus", loginStatus);
// // router.post("/upgradeUser", upgradeUser);

// // auth routes
// router.post("/sendAutomatedEmail", /* protect, */ sendAutomatedEmail);
// router.post("/sendVerificationEmail", protect, sendVerificationEmail);
// router.patch("/changePassword", protect, changePassword);
// router.patch("/verifyUser/:verificationToken", verifyUser);
// router.post("/forgotPassword", forgotPassword);
// router.patch("/resetPassword/:resetToken", resetPassword);

// router.post("/sendLoginCode/:email", sendLoginCode);
// router.post("/loginWithCode/:email", loginWithCode);

// // router.post("/google/callback", loginWithGoogle);

// module.exports = router;
import express from "express";
const router = express.Router();

// Import middleware
import { protect } from "../middlewares/authMiddleware.js"; // Ensure you include .js

// Import controller functions
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  // deleteUser,
  loginStatus,
  sendAutomatedEmail,
  sendVerificationEmail,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
  sendLoginCode,
  loginWithCode,
  getUsers,
} from "../controllers/userController.js"; // Ensure you include .js

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

// Admin routes
router.get("/getUsers", /* protect, authorOnly, */ getUsers);
router.get("/loginStatus", loginStatus);

// Auth routes
router.post("/sendAutomatedEmail", /* protect, */ sendAutomatedEmail);
router.post("/sendVerificationEmail", protect, sendVerificationEmail);
router.patch("/changePassword", protect, changePassword);
router.patch("/verifyUser/:verificationToken", verifyUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.post("/sendLoginCode/:email", sendLoginCode);
router.post("/loginWithCode/:email", loginWithCode);

// Export the router
export default router;
