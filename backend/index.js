import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/user.router.js";
import adminRouter from "./routes/admin.router.js";
import cookieparser from "cookie-parser";
import { createServer } from "http";
dotenv.config();

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: process.env.FRONTEND_URL, // Update with your React app's URL
  credentials: true,
};

app.use(cors());
app.use(express.json());
app.use(cookieparser());

app.get("/", (req, res, err) => {
  try {
    console.log("Test OK!!!");
    res.status(200).json({ message: "Test success" });
  } catch (error) {
    console.log("Error -> ", error.message);
    res.status(404).json({ message: "Test Failed" });
  }
});

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

export { app, server };
export default app;
