const mongoose = require('mongoose');
const { number } = require('zod');

mongoose.connect('mongodb+srv://admin:sahipara56@cluster0.ddgx5.mongodb.net/paytm');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30
    }
})

const userModel = mongoose.model('Users', userSchema);

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})

const accountModel = mongoose.model('Accounts', accountSchema)

module.exports = {
    userModel,
    accountModel
}
