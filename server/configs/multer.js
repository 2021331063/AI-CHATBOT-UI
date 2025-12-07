import multer from "multer";
import path from "path";

const imageStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
export const uploadImage = multer({ storage: imageStorage });

const pdfStorage = multer.memoryStorage();
export const uploadPdf = multer({ storage: pdfStorage });
