import express from "express";
import { registerAdmin, getUsers } from "../controllers/admin.controller.js";
import { updateUser, deleteUser } from "../controllers/user.controller.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.get("/getUsers", getUsers);
router.delete("/deleteUser/:id", verifyAdmin, deleteUser);
router.post("/updateUser/:id", verifyAdmin, updateUser);

export default router;
