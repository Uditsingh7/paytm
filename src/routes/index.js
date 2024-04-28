const { Router } = require('express');
const router = Router();
const userRouter = require('./userRoutes');
const accountRouter = require('./accountRoutes');


router.use("/user", userRouter);

router.use('/account', accountRouter);

router.get("/", (req, res) => {
    res.end("It is the end!")
})

module.exports = { router };