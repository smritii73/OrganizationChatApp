import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
      unique: true, // Keep only here
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // Keep only here
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 6,
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },

    profilePic: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true }
);

// ❌ REMOVE ALL schema.index() lines
// ❌ DO NOT define indexes again below

const User = mongoose.model("User", userSchema);

export default User;
