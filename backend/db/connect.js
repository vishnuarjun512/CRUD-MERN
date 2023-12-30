import mongoose from "mongoose";

//Connecting to MONGODB
export default function connect() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB!");
    })
    .catch((err) => {
      console.log("Error Connecting to MongoDB -> ", err);
    });
}
