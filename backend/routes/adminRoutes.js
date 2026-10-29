const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/authControllers');


router.post('/adminLogin', adminLogin);

module.exports = router;
