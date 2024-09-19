// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");
// const bcrypt = require("bcryptjs");
// const { generateToken, hashToken } = require("../utils/index");
// // var parser = require("ua-parser-js");
// const jwt = require("jsonwebtoken");
// const sendEmail = require("../utils/sendEmail");
// // import sendEmail from "../utils/sendEmail";
// const Token = require("../models/tokenModel");
// const crypto = require("crypto");
// const Cryptr = require("cryptr");

// const { OAuth2Client } = require("google-auth-library");

import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken, hashToken } from "../utils/index.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import Token from "../models/tokenModel.js";
import crypto from "crypto";
import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.CRYPTR_KEY);
// let cyptrsecrect = process.env.CRYPTR_KEY;

console.log("Cryptr secrect key", process.env.CRYPTR_KEY);
console.log(" jwt  key", process.env.JWT_SECRET);
console.log("EMAIL_HOST", process.env.EMAIL_HOST);
console.log("EMAIL_USER", process.env.EMAIL_USER);
console.log("EMAIL_PASS", process.env.EMAIL_PASS);

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, user_type, password } = req.body;

  console.log("user data in usercontroller ", req.body);

  //   Validation
  if (!name || !email || !phone || !user_type || !password) {
    res.status(400);
    throw new Error("Please fill in all the required fields.");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("password must be up to 6 characters ");
  }

  //   Check if user exists
  const userExits = await User.findOne({ email });

  if (userExits) {
    res.status(400);
    throw new Error("Email already in use");
  }

  //   // Get Useragent
  //   const ua = parser(req.headers["user-agent"]);
  //   const userAgent = [ua.ua];

  const user = await User.create({
    name,
    email,
    password,
    phone,
    user_type,
    // userAgent,
  });

  //   Generate Token
  const token = generateToken(user._id);

  // send HTTP - Only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true,
  });

  if (user) {
    const { _id, name, email, phone, photo, user_type, isVerified } = user;

    res.status(201).json({
      _id,
      name,
      email,
      phone,
      photo,
      user_type,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login Useer
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("please add email and password");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found, please Signup");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invaild email or password");
  }

  // Trigger 2FA for unknown User Agrnt
  // const ua = parser(req.headers["user-agent"]);
  // const thisUserAgent = ua.ua;
  // console.log(thisUserAgent);
  // const allowedAgent = user.userAgent.includes(thisUserAgent);

  // if (!allowedAgent) {
  //   // Genrate 6 digit code
  //   const loginCode = Math.floor(100000 + Math.random() * 900000);
  //   // console.log(loginCode);

  //   // Encrypt login code before saving to DB
  //   const encryptedLoginCode = cryptr.encrypt(loginCode.toString());

  //   // Delete Token if it exists in DB
  //   let userToken = await Token.findOne({ userId: user._id });
  //   if (userToken) {
  //     await userToken.deleteOne();
  //   }

  //   // Save Tokrn to DB
  //   await new Token({
  //     userId: user._id,
  //     lToken: encryptedLoginCode,
  //     createdAt: Date.now(),
  //     expiresAt: Date.now() + 60 * (60 * 1000), // 60mins
  //   }).save();

  //   res.status(400);
  //   throw new Error("New browser or device detected");
  // }

  //   Generate TOken
  const token = generateToken(user._id);

  if (user && passwordIsCorrect) {
    // sned Http only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, photo, role, isVerified } = user;

    res.status(200).json({
      _id,
      name,
      email,
      phone,
      photo,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(500);
    throw new Error("Somethimg went wrong, Please try again");
  }
});

// Send LOgin Code
const sendLoginCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not Found");
  }

  //   FInd Login Code In db
  let userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("InValid or Expires token, Please login again");
  }

  const loginCode = userToken.lToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode);

  //   Send LOgin COde
  const subject = "Login Access Code CropNow";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@cropnow.in";
  const template = "loginCode";
  const name = user.name;
  const link = decryptedLoginCode;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: `Access code sent to ${email}` });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, Please try again");
  }
});

// Login With Code
const loginWithCode = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  //   FInd user Login Token
  const userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expires Token, Please Login Again");
  }

  const decryptedLoginCode = cryptr.decrypt(userToken.lToken);
  if (loginCode !== decryptedLoginCode) {
    res.status(400);
    throw new Error("Incorrect Login Code, Please try Again");
  } else {
    // Register User
    // const ua = parser(req.headers["user-agent"]);
    // const thisUserAgent = ua.ua;
    // user.userAgent.push(thisUserAgent);
    // await user.save();

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, photo, user_type, isVerified } = user;

    res.status(200).json({
      _id,
      name,
      email,
      phone,
      photo,
      user_type,
      isVerified,
      token,
    });
  }
});

// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  // Delete Token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // Create verification token and save
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  // console.log(verificationToken);

  //   Hash token and save
  const hashedToken = hashToken(verificationToken);
  await new Token({
    userId: user._id,
    vToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // 60 mins
  }).save();

  //   construct verification Url
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  //  Send Email
  const subject = "Verify Your Account - CropNow";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;
  const reply_to = "noreply@cropnow.in";
  const template = "verifyEmail";
  const name = user.name;
  const link = verificationUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      send_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Verification Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, Please try Again");
  }
});

// verify User
const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  const hashedToken = hashToken(verificationToken);

  const userToken = await Token.findOne({
    vToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired TOken");
  }

  //   FInd User
  const user = await User.findOne({ _id: userToken.userId });

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }

  // Now Verify User
  user.isVerified = true;
  await user.save();

  res.status(200).json({ message: "Account Verification Successful" });
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), // 1day
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Logout successful" });
});

// Get User
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, phone, photo, user_type, isVerified } = user;

    res.status(200).json({
      _id,
      name,
      email,
      phone,
      photo,
      user_type,
      isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, phone, photo } = user;

    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.photo = req.body.photo || photo;

    const updateUser = await user.save();

    res.status(200).json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      phone: updateUser.phone,
      photo: updateUser.photo,
      user_type: updateUser.user_type,
      isVerified: updateUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not Found");
  }
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
  const user = user.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User Not Found");
  }

  await user.remove();
  res.status(200).json({
    message: "User deleted Successfully",
  });
});

// Get Users
const getUsers = asyncHandler(async (req, res) => {
  // This is try catch block added

  // const users = await User.find().sort("-createdAt").select("-password");
  // if (!users) {
  //     res.status(500);
  //     throw new Error("Something went wrong");
  // }
  // res.status(200).json(users);
  try {
    const users = await User.find().sort("-cretaedAt").select("-password");
    if (users) {
      res.status(200).json(users);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  //   Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

// upGrade User or change User role
// const upgradeUser = asyncHandler(async (req, res) => {
//   const { role, id } = req.body;

//   const user = await User.findById(id);

//   if (!user) {
//     res.status(404);
//     throw new Error("User not found");
//   }

//   user.role = role;
//   await user.save();

//   res.status(200).json({
//     message: `User role updated to ${role}`,
//   });
// });

// Send Automated Mails
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500);
    throw new Error("Missing email parameters");
  }

  //   Get User
  const user = await User.findOne({ email: send_to });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FRONTEND_URL}${url}`;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, Please try again");
  }
});

// Forget Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("NO user with this email");
  }

  // Delete Token If It exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  //   Created Verification TOken and Save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  // console.log(resetToken);

  //  Hash Token and save
  const hashedToken = hashToken(resetToken);

  await new Token({
    userId: user._id,
    rToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * (60 * 1000), // 60 mins
  }).save();

  // construct Reset Url

  const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

  // Send Email

  const subject = "Password Reset Request - Nekaaramitra";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@cropnow.in";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

  try {
    await sendEmail(
      subject,
      send_to,
      sent_from,
      reply_to,
      template,
      name,
      link
    );
    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, Please try again");
  }
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  // console.log(resetToken);
  // console.log(password);

  const hashedToken = hashToken(resetToken);

  const userToken = await Token.findOne({
    rToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expires Token");
  }

  //   Find User
  const user = await User.findOne({ _id: userToken.userId });

  //   Now Reset Password
  user.password = password;
  await user.save();

  res.status(200).json({ message: "Password Reset Successful, Please Login" });
});

// Chane PassWord
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please Enter old And New Password");
  }

  //   Check if old password is correct

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // Save new Password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();

    res
      .status(200)
      .json({ message: "Password Change Successful, please re-login" });
  } else {
    res.status(400);
    throw new Error("Old Password is inCorrect");
  }
});

// // Login with Google
// const loginWithGoogle = asyncHandler(async (req, res) => {
//   const { userToken } = req.body;

//   const ticket = await client.verifyIdToken({
//     idToken: userToken,
//     audience: process.env.GOOGLE_CLIENT_ID,
//   });

//   const payload = ticket.getPayload();
//   const { name, email, picture, sub } = payload;
//   const password = Date.now() + sub;

//   // Get UserAgent
//   const ua = parser(req.headers["user-agent"]);
//   const userAgent = [ua.ua];

//   // Check if user exits
//   const user = await User.findOne({ email });

//   if (!user) {
//     // Create new User
//     const newUser = await User.create({
//       name,
//       email,
//       password,
//       photo: picture,
//       isVerified: true,
//       userAgent,
//     });

//     if (newUser) {
//       // Generate Token
//       const token = generateToken(newUser._id);

//       // Send HTTP-only cookie

//       res.cookie("token", token, {
//         path: "/",
//         httpOnly: true,
//         expires: new Date(Date.now() + 1000 * 86400), //1 day
//         sameSite: "none",
//         secure: true,
//       });

//       const { _id, name, email, phone, photo, role, isVerified } = newUser;

//       res.status(201).json({
//         _id,
//         name,
//         email,
//         phone,
//         photo,
//         role,
//         isVerified,
//         token,
//       });
//     }
//   }

//   //   User exists, Login

//   if (user) {
//     const token = generateToken(user._id);

//     // Send HTTP-only cookie
//     res.cookie("token", token, {
//       path: "/",
//       httpOnly: true,
//       expires: new Date(Date.now() + 1000 * 86400), // 1 day
//       sameSite: "none",
//       secure: true,
//     });

//     const { _id, name, email, phone, bio, photo, role, isVerified } = user;

//     res.status(201).json({
//       _id,
//       name,
//       email,
//       phone,
//       bio,
//       photo,
//       role,
//       isVerified,
//       token,
//     });
//   }
// });

// module.exports = {
//   registerUser,
//   loginUser,
//   logoutUser,
//   getUser,
//   updateUser,
//   deleteUser,
//   getUsers,
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
// };

export {
  registerUser,
  loginUser,
  sendLoginCode,
  loginWithCode,
  sendVerificationEmail,
  verifyUser,
  logoutUser,
  getUser,
  updateUser,
  changePassword,
  forgotPassword,
  getUsers,
  loginStatus,
  resetPassword,
  sendAutomatedEmail,
};
