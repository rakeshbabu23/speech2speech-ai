import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// real

import fs from "fs";
import Groq from "groq-sdk";
import process from "node:process";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function main(filename) {
  console.log(filename);
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(`./uploads/${filename}`),
    model: "whisper-large-v3-turbo",
    prompt: "Specify context or spelling",
    response_format: "json",
    language: "en",
    temperature: 0.0,
  });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "tunedModels/increment-ntysbfnr3ywf",
  });
  const result = await model.generateContent(transcription.text);
  console.log(result.response.text());
  return result.response.text();
}
