import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 100) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to Continue.",
      });
    }
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type)
VALUES (${userId}, ${prompt}, ${content}, 'article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        free_usage: free_usage + 1,
      });
    }

    res.json({ success: true, content });

    console.log(response.choices[0].message);
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 100) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to Continue.",
      });
    }
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations(user_id, prompt, content, type)
VALUES (${userId}, ${prompt}, ${content}, 'blog-article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        free_usage: free_usage + 1,
      });
    }

    res.json({ success: true, content });

    console.log(response.choices[0].message);
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;
    // const free_usage = req.free_usage;

    if (plan !== "premium" /* && free_usage >=100 */) {
      return res.json({
        success: false,
        message: "This feature is available for premium subscriptions",
      });
    }

    

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: 'background_removal',
          background_removal: 'remove_the_background',
        },
      ],
    });

    await sql`INSERT INTO creations(user_id, prompt, content, type )
VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;
   fs.unlinkSync(image.path);
    res.json({ success: true , content: secure_url });

    console.log(response.choices[0].message);
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;

    const image = req.file;
    const plan = req.plan;
    // const free_usage = req.free_usage;

    if (plan !== "premium" /* && free_usage >=100 */) {
      return res.json({
        success: false,
        message: "This feature is available for premium subscriptions",
      });
    }

   const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`INSERT INTO creations(user_id, prompt, content, type )
VALUES (${userId}, 'Remove object from image', ${imageUrl}, 'image')`;
    
    fs.unlinkSync(image.path)
    res.json({ success: true, content: imageUrl });

   
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const chatWithAI = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { message } = req.body;

    if (!message) {
      return res.json({ success: false, message: "No message provided" });
    }

    // Optional: check user plan / free_usage from req.plan, req.free_usage

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    // Optionally store chat history in DB here

    res.json({ success: true, reply });
  } catch (error) {
    console.error("chatWithAi error:", error);
    res.json({ success: false, message: error.message || "Unknown error" });
  }
};