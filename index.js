const express = require("express");
require("dotenv").config();
require("./db/connection").connect();
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 8000;
app.use(express.json());
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user"); 
const adminRouter = require("./routes/adminProfile");

app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
    // allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods", "Access-Control-Allow-Credentials"]
  })
);
app.use("/api/v1/user", userRouter); 
app.use("/api/v1/admin", adminRouter);

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});

