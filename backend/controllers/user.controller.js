import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const profile = (req, res, err) => {
  try {
    const token = req.cookies.auth_token;
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(403).json({ error: "Forbidden" });
      }
      res.status(200).json({ user: data.user });
    });
  } catch (err) {
    console.log(err);
    res.status(201).json({
      error: "Profile Server Error",
    });
  }
};

export const getUser = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    const userId = tokenData.userId;
    const username = tokenData.user.username;
    return res.status(200).json({ userId, username, user: tokenData.user });
  } catch (error) {
    console.log("GetLogged Error -> ", error.message);
    return res.status(201).json({ message: "Get User Server Failed" });
  }
};

export const loginUser = async (req, res, err) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const checkUser = await User.findOne({ $or: [{ username }, { email }] });
    if (checkUser) {
      const checkPassword = bcryptjs.compareSync(password, checkUser.password);

      if (checkPassword) {
        const { password, ...rest } = checkUser._doc;
        const token = jwt.sign(
          { userId: checkUser._id, user: rest },
          process.env.JWT_SECRET
        );
        return res
          .cookie("auth_token", token, { httpOnly: true })
          .status(200)
          .json({
            error: false,
            message: "Login Success",
            user: rest,
          });
      } else {
        return res
          .status(201)
          .json({ error: true, message: "Credentials dont match" });
      }
    } else {
      res.status(201).json({ error: true, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(201).json({ error: true, message: "Internal Server Error" });
  }
};

export const registerUser = async (req, res, err) => {
  try {
    const { username, email, password, mobile, profilePic } = req.body;
    const data = await User.findOne({ $or: [{ email }, { username }] });

    if (data) {
      return res
        .status(201)
        .json({ error: true, message: "User already registered" });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      mobile,
    });
    if (profilePic !== undefined) {
      newUser.profilePic = profilePic;
    }
    const savedUser = await newUser.save();
    return res.status(200).json({ error: false, message: "Register Success" });
  } catch (error) {
    console.log(error);
    return res
      .status(201)
      .json({ error: true, message: "Internal Server Error" });
  }
};

export const signout = async (req, res, next) => {
  try {
    res
      .clearCookie("auth_token")
      .status(200)
      .json({ error: false, message: "Signout Success" });
  } catch (error) {
    console.log(error);
    res.status(201).json({ error: true, message: "Signout Success" });
  }
};

export const deleteUser = async (req, res, err) => {
  try {
    console.log(req.params.id);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      error: false,
      message: " User Deleted Success",
    });
  } catch (error) {
    console.log(error);
    res.status(201).json({
      error: "Account deletion failed",
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res, err) => {
  try {
    const { username, profilePic, password } = req.body;
    console.log("username password -> ", username, password);
    console.log("Body-> ", req.body);

    let updateFields = {
      username,
      profilePic,
    };

    // Check if password is provided
    if (password) {
      // Hash the password
      var hashedPass = bcryptjs.hashSync(password, 10);
      // Include hashed password in the update fields
      updateFields.password = hashedPass;
    }

    const userCheck = await User.findOneAndUpdate(
      { _id: req.params.id },
      updateFields,
      { new: true } // Return the updated document
    );

    if (!req.body.admin) {
      const newToken = jwt.sign(
        { userId: userCheck._id, user: userCheck },
        process.env.JWT_SECRET
      );
      res.cookie("auth_token", newToken, { httpOnly: true });
    }

    console.log("Updated User -> ", userCheck);
    res.status(200).json({
      data: req.body,
      newData: userCheck,
      message: "User Update Success",
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({ error: "User Update Failed" });
  }
};
