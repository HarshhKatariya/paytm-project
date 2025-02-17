const express = require('express');
const { accountModel } = require('../db');
const { authMiddleware } = require('../middleware');
const { default: mongoose } = require('mongoose');
const accountRouter  = express.Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {
    const account = await accountModel.findOne({
        userId: req.userId
    });
    res.json({
        balance : account.balance
    })
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();

    const { amount, to } = req.body;

    const account = await accountModel.findOne({
        userId: req.userId
    }).session(session);

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            msg: "Insufficient balance"
        });
    }

    const toAccount = await accountModel.findOne({
        userId: to
    }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            msg: "Invalid account"
        })
    }

    await accountModel.updateOne({
        userId: req.userId
    },
    {
        $inc: {
            balance: -amount
        }  
    }).session(session);

    await accountModel.updateOne({
        userId: to
    },
    {
        $inc: {
            balance: amount
        }
    }).session(session);

    await session.commitTransaction();

    res.status(200).json({
        msg: "Transaction successful"
    })
})

module.exports = accountRouter;