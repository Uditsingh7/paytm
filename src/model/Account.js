const mongoose = require('mongoose');
const { Schema } = mongoose;

// mongoose.connect('mongodb://localhost:27017/paytm')
const accountSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }

})

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;

