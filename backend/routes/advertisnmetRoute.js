
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const advertismentController = require('../controllers/advertismentController');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let base = path.join(__dirname, '../public/ads');
    let folder;

    if (file.mimetype === 'application/pdf') {
      folder = path.join(base, 'pdfs');
    } else if (file.mimetype.startsWith('image/')) {
      folder = path.join(base, 'images');
    } else {
      return cb(new Error('Unsupported file type'), false);
    }

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, 
});

router.get('/', advertismentController.getAds);
router.get('/:id', advertismentController.getAdById);

router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  advertismentController.createAd
);

router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  advertismentController.updateAd
);

router.delete('/:id', advertismentController.deleteAd);

module.exports = router;
