import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import dommatrix from "dommatrix";
const { DOMMatrix } = dommatrix;
global.DOMMatrix = DOMMatrix;

import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import FormData from "form-data";
import axios from "axios";
import OpenAI from "openai";



const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});


export async function extractPdfText(buffer) {
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((i) => i.str).join(" ") + "\n";
  }

  return text;
}


import sql from "../configs/db.js";
// import OpenAI from "openai";

export const generateArticle = async (req, res) => {
  try {
    const { prompt, length } = req.body;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    // Save to database
    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${prompt}, ${content}, 'article')
      RETURNING *;
    `;

    res.json({ success: true, content, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export const generateBlogTitle = async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${prompt}, ${content}, 'blog-title')
      RETURNING *;
    `;

    res.json({ success: true, content, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.json({ success: false, message: "No message provided" });

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    // Save to database
    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${message}, ${reply}, 'chat')
      RETURNING *;
    `;

    res.json({ success: true, reply, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



export const removeImageBackground = async (req, res) => {
  try {
    const image = req.file;
    if (!image)
      return res.json({ success: false, message: "No image uploaded" });

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    fs.unlinkSync(image.path);

    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES ('Remove image background', ${secure_url}, 'image-background')
      RETURNING *;
    `;

    res.json({ success: true, content: secure_url, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};




export const removeImageObject = async (req, res) => {
  try {
    const { object } = req.body;
    const image = req.file;
    if (!image)
      return res.json({ success: false, message: "No image uploaded" });

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    fs.unlinkSync(image.path);

    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${`Remove object: ${object}`}, ${imageUrl}, 'image-object')
      RETURNING *;
    `;

    res.json({ success: true, content: imageUrl, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};




export const resumeReview = async (req, res) => {
  try {
    if (!req.file)
      return res.json({ success: false, message: "No file uploaded" });

    const buffer = req.file.buffer;
    if (!buffer || buffer.length === 0)
      return res.json({ success: false, message: "Uploaded PDF is empty" });

    const text = await extractPdfText(buffer);
    const prompt = `Review the following resume:\n\n${text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${prompt}, ${content}, 'resume-review')
      RETURNING *;
    `;

    res.json({ success: true, content, dbEntry: result[0] });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



export const getCreations = async (req, res) => {
  try {
    const result = await sql`SELECT * FROM creations ORDER BY id DESC`;
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get Creations Error:", error);
    res.json({ success: false, message: "Failed to load creations" });
  }
};
