const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    walletId: {
        type: String,
        ref: 'Wallet',
        required: true
    },
    referenceNumber: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit', 'transfer'],
        required: true
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'NGN'
    },
    balanceBefore: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    balanceAfter: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamp: true,
    versionKey: false
});

const Transaction = mongoose.model('transaction', TransactionSchema);

module.exports = Transaction;