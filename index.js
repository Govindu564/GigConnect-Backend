import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected Successfully!"))
  .catch((err) => console.error("Error connnecting to MongoDb:", err));


app.get("/", (req, res) => {
  res.send("this is root page!");
});

app.listen(PORT, (req, res) => {
  console.log(`Server running on port ${PORT}`);
});
