import jwt from "jsonwebtoken";

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(201).json({ error: true, message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      console.log(data.user.username);
      if (err) {
        return res.status(403).json({ error: true, message: "Forbidden" });
      }
    });
    next();
  } catch (error) {
    console.log(error);
  }
};
