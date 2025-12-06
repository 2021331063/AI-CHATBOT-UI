import express from "express";
import { uploadImage, uploadPdf } from "../configs/multer.js";
import {
  generateArticle,
  generateBlogTitle,
  // generateImage,
  removeImageBackground,
  removeImageObject,
  resumeReview,
  chatWithAI,
} from "../controllers/aiController.js";


const router = express.Router();

router.post("/generate-article", generateArticle);
router.post("/generate-blog-title", generateBlogTitle);
// router.post("/generate-image", generateImage);
router.post(
  "/remove-image-background",
  uploadImage.single("image"),
  removeImageBackground
);
router.post(
  "/remove-image-object",
  uploadImage.single("image"),
  removeImageObject
);
router.post("/resume-review", uploadPdf.single("resume"), resumeReview);
router.post("/chat", chatWithAI);


export default router;
