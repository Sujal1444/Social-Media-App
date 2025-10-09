import express from 'express';
import multer from 'multer';
const router = express.Router();

// use for upload the image, video and more...

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
});
const upload = multer({ storage: storage });


router.post('/', upload.single("file"), (req, res) => {
    try {
        return res.status(200).json("File Upload Successfully");
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
})


export default router;