// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    user_type: {
      type: String,
      enum: [
        "Farmer",
        "Agricultural Specialist",
        "Investor",
        "Student",
        "Government Organization",
        "Retailer",
        "Other",
      ],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Check if the phone number is exactly 10 digits
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid phone number! It must be exactly 10 digits.`,
      },
    },
    password: {
      type: String,
      required: [true, "Please add a Password"],
    },

    photo: {
      type: String,
      required: [true, "please add a Photo"],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    usertype: {
      type: String,
      required: true,
      default: "subscriber",
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    // userAgent: {
    //   type: Array,
    //   required: true,
    //   default: [],
    // },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", userSchema);
// module.exports = User;
export default User;
