import app from "./index.js";
import connect from "./db/connect.js";

connect();

const port = process.env.SERVER_PORT;
app.listen(port, () => {
  console.log("Server is running on port:", port);
});
