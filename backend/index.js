import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./ai.service.js";
import multer from "multer";
import cors from "cors";
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};
import path from "path";
import fs from "fs";
import { main } from "./ai.service.js";
// // const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });
const app = express();
app.use(cors(corsOptions));
app.post("/api/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("Uploading file", req.file);
  const result = await main(req.file.filename);
  return res.status(200).json({ message: result });
});

app.listen(3000, () => console.log("listening on port 3000"));
