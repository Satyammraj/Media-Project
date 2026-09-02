import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_") // strip anything not alphanumeric
      .slice(0, 50); // avoid absurdly long names

    cb(null, `${uniqueSuffix}-${base}${ext}`);
  },
})

export const upload = multer({
     storage,
    })