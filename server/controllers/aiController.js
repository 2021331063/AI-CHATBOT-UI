import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import axios from "axios";
import sql from "../configs/db.js";
import pdfExtraction from "pdf-extraction";

export async function extractPdfText(buffer) {
  try {
    const data = await pdfExtraction(buffer); // <-- FIXED
    return data.text || "";
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    throw new Error("Failed to read the PDF file");
  }
}



export async function askGemini(message) {
  if (!message) throw new Error("No message provided to Gemini API");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: message }] }],
    });

    
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response received";

    return reply;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return "Gemini API request failed!";
  }
}




export const generateArticle = async (req, res) => {
  try {
    const { prompt, length } = req.body;
    const content = await askGemini(prompt, length);

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
    const content = await askGemini(prompt, 100);

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

    const reply = await askGemini(message, 500);

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



export const resumeReview = async (req, res) => {
  try {
    if (!req.file)
      return res.json({ success: false, message: "No file uploaded" });

    const buffer = req.file.buffer;
    if (!buffer || buffer.length === 0)
      return res.json({ success: false, message: "Uploaded PDF is empty" });

    const text = await extractPdfText(buffer);
    const prompt = `Review the following resume:\n\n${text}`;
    const content = await askGemini(prompt, 1000);

    const result = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${prompt}, ${content}, 'resume-review')
      RETURNING *;
    `;

    res.json({ success: true, content, dbEntry: result[0] });
  } catch (error) {
    console.error("Resume Review Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};



export const removeImageBackground = async (req, res) => {
  try {
    const image = req.file;
    if (!image)
      return res.json({ success: false, message: "No image uploaded" });

    const result = await new Promise((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        { transformation: [{ effect: "background_removal" }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(image.buffer).pipe(upload_stream);
    });

    const secure_url = result.secure_url;

    const dbResult = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES ('Remove image background', ${secure_url}, 'image-background')
      RETURNING *;
    `;

    res.json({ success: true, content: secure_url, dbEntry: dbResult[0] });
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

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(image.buffer).pipe(stream);
      });

    const result = await uploadStream();

    
    const imageUrl = cloudinary.url(result.public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    
    const dbEntry = await sql`
      INSERT INTO creations (prompt, content, type)
      VALUES (${`Remove object: ${object}`}, ${imageUrl}, 'image-object')
      RETURNING *;
    `;

    res.json({ success: true, content: imageUrl, dbEntry: dbEntry[0] });
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