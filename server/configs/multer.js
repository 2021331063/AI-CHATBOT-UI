import multer from "multer";

const imageStorage = multer.memoryStorage();
export const uploadImage = multer({ storage: imageStorage });

const pdfStorage = multer.memoryStorage();
export const uploadPdf = multer({ storage: pdfStorage });
