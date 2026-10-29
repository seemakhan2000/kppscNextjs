const express = require('express');
const router = express.Router();

const { registerUser, loginUser } = require('../controllers/userConttroller');

router.post('/users/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
