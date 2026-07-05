const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'imageEcom'));
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + extension d'origine
    const ext = path.extname(file.originalname);
    const nomUnique = `produit-${Date.now()}${ext}`;
    cb(null, nomUnique);
  }
});

const fileFilter = (req, file, cb) => {
  const typesAutorises = /jpeg|jpg|png|webp/;
  const extValide = typesAutorises.test(path.extname(file.originalname).toLowerCase());
  const mimeValide = typesAutorises.test(file.mimetype);

  if (extValide && mimeValide) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images (jpg, jpeg, png, webp) sont autorisées'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

module.exports = upload;