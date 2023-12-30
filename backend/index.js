import express from "express";
import mongoose from "mongoose";
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
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieparser());

app.get("/", (req, res, err) => {
  console.log("Test OK!!!");
});

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

//Connecting to MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log("Error Connecting to MongoDB -> ", err);
  });

const port = process.env.SERVER_PORT;
server.listen(port, () => {
  console.log("Server is running on port:", port);
});
