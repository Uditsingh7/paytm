const { default: mongoose } = require('mongoose');
const Account = require('../model/Account');
const zod = require('zod');



const getAccountBalance = async (req, res) => {
    try {
        let userId = req.userId;
        const account = await Account.findOne({ userId });
        if (!account) {
            return res.status(401).json({
                success: false,
                message: "No user found!"
            })
        }
        return res.status(200).json({
            success: true,
            balance: account.balance
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        }
        );
    }
}

const transferBody = zod.object({
    to: zod.string(),
    balance: zod.number()
})
const transferBalance = async (req, res) => {
    try {
        // Validate the request body using Zod
        const session = await mongoose.startSession()
        session.startTransaction();
        const { success } = transferBody.safeParse(req.body);
        const userId = req.userId;
        const toUserId = req.body.to;
        console.log(toUserId)
        if (!success) {
            await session.abortTransaction()
            return res.status(400).json({
                success: false,
                message: "Incorrect inputs"
            })
        }

        const account = await Account.findOne({ userId }).session(session);
        console.log("Account: ", account);
        const toAccount = await Account.findOne({ userId: toUserId }).session(session)
        console.log("To Account: ", toAccount);
        if (!account || !toAccount) {
            await session.abortTransaction()
            return res.status(401).json({
                success: false,
                message: "invalid account!"
            })
        }
        if (account.balance < req.body.balance) {
            await session.abortTransaction()
            return res.status(403).json({
                success: false,
                message: `You don't have enough money in your account`
            });
        }

        // Update users account balance
        await Account.updateOne({
            userId: userId
        }, {
            $inc: {
                balance: -req.body.balance
            }
        }).session(session)

        // Update to Users account balance
        await Account.updateOne({
            userId: toUserId
        }, {
            $inc: {
                balance: req.body.balance
            }
        }).session(session)

        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: "Transfer successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        }
        );
    }
}

module.exports = {
    getAccountBalance,
    transferBalance
}