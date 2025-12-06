import multer from "multer";
import path from "path";

// For images (diskStorage)
const imageStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
export const uploadImage = multer({ storage: imageStorage });

// For PDFs (memoryStorage)
const pdfStorage = multer.memoryStorage();
export const uploadPdf = multer({ storage: pdfStorage });
