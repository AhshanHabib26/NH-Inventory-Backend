const express = require('express');
const router = express.Router()
const { createProduct } = require('../controllers/productCntoller');
const { protect } = require('../middleware/authHandler');
const { upload } = require('../utils/imageUpload');


router.post('/', protect, upload.single("image"), createProduct)


module.exports = router