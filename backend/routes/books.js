const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sharp = require('../middleware/sharp-config');

const bookCtrl = require('../controllers/books');

router.get("/", bookCtrl.getAllBooks);
router.post("/:id/rating", auth, bookCtrl.ratingBook);
router.get("/bestrating", bookCtrl.getBestRatedBooks);
router.post('/', auth, multer, sharp, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;