const User = require('../model/User');
const Account = require('../model/Account');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require("../../config");
const bcrypt = require('bcrypt');

//schema for create user valdiation
const createUserBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8),
    firstName: zod.string(),
    lastName: zod.string(),
    mobileNumber: zod.string().max(10)
})

// schema for login in user validation

const loginUserBody = zod.object({
    username: zod.string().email(),
    password: zod.string().min(8)
})

// schema fro udpate user validation

const updateUserProfile = zod.object({
    username: zod.string().email().optional(),
    password: zod.string().min(8).optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    mobileNumber: zod.string().max(10).optional()
})

// Create a user
const createUser = async (req, res) => {
    try {
        // Extract data from the request body
        const { success } = createUserBody.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                success: false,
                message: "Incorrect Input"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { mobileNumber: req.body.mobileNumber }
            ]
        });


        console.log(existingUser);

        if (existingUser) {
            return res.status(409).send({
                success: false,
                message: "Email/Mobile is already in use."
            })
        }

        const user = await User.create({
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName || "",
            lastName: req.body.lastName || "",
            mobileNumber: req.body.mobileNumber
        })

        const userId = user._id;
        await Account.create({
            userId: userId,
            balance: 1 + Math.random() * 10000
        })
        
        const token = jwt.sign({
            userId
        }, JWT_SECRET)

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            id: userId,
            token: token
        })
    }
    catch (error) {
        console.log("Error in signup controller", error);
        res.status(500).send({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

const generateToken = (id) => {
    return jwt.sign({
        userId: id
    }, JWT_SECRET)
}

const loginUser = async (req, res) => {
    try {
        const { success } = loginUserBody.safeParse(req.body);
        if (!success) {
            res.status(411).json({
                success: false,
                message: 'Invalid request body'
            })
        }
        const user = await User.findOne({
            email: req.body.username
        })
        console.log(user)
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid username/password'
            })
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            return res.status(403).json({
                success: false,
                message: 'Invalid username/password'
            })
        }

        return res.status(200).json({
            success: true,
            token: generateToken(user._id),
        })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const { success } = updateUserProfile.safeParse(req.body);
        if (!success) {
            res.status(411).json({
                success: false,
                message: 'Invalid request body'
            })
        }

        const userId = req.userId;
        const updateUser = await User.updateOne({ _id: userId }, req.body);
        if (updateUser.nModified === 0) {
            return res.status(404).json({
                success: false,
                message: `No user found with id ${userId}`
            });
        }
        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        })
    }

    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}

const getUsers = async (req, res) => {
    try {
        let query = {}
        const { filter } = req.query;
        if (filter) {
            query = {
                $or: [
                    { firstName: new RegExp(filter, "i") },
                    { lastName: new RegExp(filter, "i") }
                ]
            }
        }
        const users = await User.find(query).select('-password'); //add more filters here
        return res.status(200).json({
            success: 200,
            data: users
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}


module.exports = {
    createUser,
    loginUser,
    updateUser,
    getUsers
}