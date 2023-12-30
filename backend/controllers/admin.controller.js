import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, mobile, profilePic } = req.body;
    console.log(username, email, password, mobile, profilePic);
    const data = await User.findOne({ $or: [{ email }, { username }] });
    if (data) {
      return res
        .status(201)
        .json({ error: true, message: "Admin already registered" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      mobile,
      profilePic,
      isAdmin: true,
    });
    const savedUser = await newUser.save();
    console.log("saved user", savedUser);
    return res
      .status(200)
      .json({ error: false, message: "Admin Registration Success" });
  } catch (error) {
    console.log("Admin Registration Error - > ", error.message);
    return res
      .status(201)
      .json({ error: true, message: "Admin Registration Server Failed" });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const friends = await User.find();
    const data = friends.map((friend) => {
      const { password: pass, ...rest } = friend._doc;
      return rest;
    });
    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
  }
};
