const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const {userModel, accountModel} = require('../db');
const {JWT_SECRET} = require('../config');
const { authMiddleware } = require('../middleware');
const userRouter = express.Router();

// Signup route
const signupBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstname: zod.string(),
    lastname: zod.string()
})

userRouter.post('/signup', async (req, res) => {
    const {success} = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect inputs"
        })
    }

    const existingUser = await userModel.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.status(411).json({
            msg: "Email already exists"
        })
    }

    const user = await userModel.create({
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
    })

    const userId = user._id;

    await accountModel.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    return res.status(200).json({
        msg: "User created successfully",
        token: token
    })

})

// Signin route
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

userRouter.post('/signin', async (req, res) => {
    const {success} = signinBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg: "Incorrect inputs"
        })
    }

    const user = await userModel.findOne({
        username: req.body.username,
        password: req.body.password
    })

    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)

        return res.status(200).json({
            msg: "Login successful",
            token: token
        })
    } else {
        return res.status(411).json({
            msg: "Error while logging in"
        })
    }
    
})

// Updating route for user information
const updateBody = zod.object({
    password: zod.string().optional(),
    firstname: zod.string().optional(),
    lastname: zod.string().optional()
})

userRouter.put("/", authMiddleware, async (req, res) => {
    const {success} = updateBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            msg: "Incorrect inputs"
        })
    }

    await userModel.updateOne(req.body, {
        id: req.userId
    })

    res.status(200).json({
        msg: "Updated successfully"
    })
})

//Filter route
userRouter.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await userModel.find({
        $or: [{
            firstname: { "$regex": filter }
        },
        { 
            lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        accounts: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})

module.exports = userRouter;