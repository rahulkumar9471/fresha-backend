const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = async () => {
  await mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to mongodb successfully"))
    .catch((error) => {
        console.log("DB connection Failed")
        console.log(error);
        process.exit(1);
    });
};
