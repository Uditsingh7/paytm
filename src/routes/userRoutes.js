const express = require('express');
const { createUser, loginUser, updateUser, getUsers } = require('../controller/userController');
const { verifyToken } = require('../middleware/authMiddleware')

const router = express.Router();

router.post("/signup", createUser)
router.post("/login", loginUser)
router.put('/', verifyToken, updateUser);
router.get('/', verifyToken, getUsers)
module.exports = router;
