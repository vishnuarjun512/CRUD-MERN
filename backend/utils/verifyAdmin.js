import jwt from "jsonwebtoken";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(201).json({ error: true, message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        return res.status(403).json({ error: true, message: "Forbidden" });
      }

      if (!data.user.isAdmin) {
        return res
          .status(403)
          .json({ error: true, message: "Only Admins can Update User Data" });
      }
    });
    next();
  } catch (error) {
    console.log(error);
  }
};
