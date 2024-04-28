const { Router } = require('express');
const router = Router();
const { getAccountBalance, transferBalance } = require('../controller/accountController');
const { verifyToken } = require('../middleware/authMiddleware')

router.get('/balance', verifyToken, getAccountBalance);
router.post('/transfer', verifyToken, transferBalance);


module.exports = router;