const User = require("../models/user.models.js");
const Wallet = require('../models/user.wallets.js');
const Flutterwave = require('flutterwave-node-v3');
const mongoose = require("mongoose");
const axios = require('axios');
const Transaction = require('../models/user.transaction.js');
const crypto = require('crypto')

require('dotenv').config();


const createWallet = async (req, res) => {
    try {
        const { userId } = req.user;
        const { currency } = req.body;

        if (!userId) {
            return res.status(400).json("User Id is required");
        }
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            // console.error("User not found with ID:", userId);
            return res.status(404).json("User not found");
        }

        const existingWallet = await Wallet.findOne({ userId: userId });

        if (existingWallet) {
            return res.status(400).json("Wallet already exists for this user");
        }


        const normalizePhoneNummber = existingUser.phoneNumber.replace(/^(\+234|0)/, '');
        

        const newWallet = new Wallet ({
            accountNumber: normalizePhoneNummber,
            currency: currency,
            userId: userId,
            balance: 0
        })

        await newWallet.save()
        return res.status(200).json({ message: "Wallet created successfully", wallet: newWallet });

    } catch (err) {
        console.error("Error creating wallet", err);
        return res.status(500).json('Internal server error');
    }

}

const getWallets = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(400).json("User Id is required");
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json("User not found");
        }

        const wallets = await Wallet.find({ userId: userId });

        if (!wallets || wallets.length === 0) {
            return res.status(404).json("No wallets found for this user");
        }

        return res.status(200).json({ wallets });

    } catch (err) {
        console.error("Error fetching wallets", err);
        return res.status(500).json('Internal server error');
    }
}

// fund transfer using $inc operator to atomically update the balances of both wallets in a single operation, ensuring data integrity and preventing race conditions

const transferFunds = async (req, res) => {
    try {
        const { userId } = req.user;
        
        const { accountNumberTo, accountNumberFrom, amount } = req.body;

        if(!userId) {
            return res.status(400).json("User is required")
        }

        if (!accountNumberTo || !accountNumberFrom || !amount) {
            return res.status(400).json("All fields are required");
        }

        const authUser = await User.findById(userId);

        if (!authUser) {
            return res.status(404).json("Authenticated user not found");
        }

        const senderWallet = await Wallet.findOne({ accountNumber: accountNumberFrom });
        const receiverWallet = await Wallet.findOne({ accountNumber: accountNumberTo });

        if (!senderWallet) {
            return res.status(404).json("Sender wallet not found");
        }

        if (!receiverWallet) {
            return res.status(404).json("Receiver wallet not found");
        }

        if (senderWallet.userId.toString() !== userId) {
            return res.status(403).json("Unauthorized: You can only transfer funds from your own wallet");
        }

        if (amount <= 0) {
            return res.status(400).json("Amount must be greater than zero");
        }



        // Debit from sender wallet using $inc with sufficient funds check
        const updatedSenderWallet = await Wallet.findOneAndUpdate(
            {
                _id: senderWallet._id,
                balance: { $gte: amount } // Only update if balance is sufficient
            },
            { $inc: { balance: -amount } },
            { new: true }
        );

        // Check if debit was successful
        if (!updatedSenderWallet) {
            return res.status(400).json("Insufficient funds in sender's wallet");
        }

        // Credit to receiver wallet using $inc
        const updatedReceiverWallet = await Wallet.findByIdAndUpdate(
            receiverWallet._id,
            { $inc: { balance: amount } },
            { new: true }
        );

        // Check if credit was successful
        if (!updatedReceiverWallet) {
            return res.status(500).json("Error crediting receiver's wallet");
        }

        return res.status(200).json({
            message: "Funds transferred successfully",
            details : {
                from : accountNumberFrom,
                to : accountNumberTo,
                amount : amount,
                balance: updatedSenderWallet.balance
            },
        });

    } catch (err) {
        console.error("Error transferring funds", err);
        return res.status(500).json('Internal server error');
    }
}

// Create Redirect url with Flutterwave
const createRedirectUrl = async (req, res) => {
    try {
        const { userId } = req.user;
        const { amount, currency, redirectUrl, accountNumber } = req.body;
        if (!userId) {
            return res.status(400).json("User is required")
        }

        if (!amount || !currency || !redirectUrl) {
            return res.status(400).json("All fields are required");
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json("User not found");
        }

        const txRef = `TX-${Date.now()}-${userId}`;

        // initialize Flutterwave

        const flw = new Flutterwave(
            process.env.FLW_PUBLIC_KEY,
            process.env.FLW_SECRET_KEY
        )

        payload = {
			tx_ref: txRef,
			amount: amount,
			currency: currency,
			redirect_url: redirectUrl,
			customer: {
				email: user.email,
				name: user.name,
				phonenumber: user.phoneNumber,
			},
			customizations: {
				title: "Wallet Funding",
                description: "Fund your wallet",
			},
            // configurations: {
			// 	session_duration: 10, // Session timeout in minutes (maxValue: 1440)
			// 	max_retry_attempt: 5, // Max retry (int)
			// },
		}

        const response = await axios.post(
            'https://api.flutterwave.com/v3/payments',

            payload,
            
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            },

        );

        const wallet = await Wallet.findOne({ accountNumber : accountNumber });
        // console.log(wallet)

        const newTransaction = new Transaction({
            userId: userId,
            walletId: wallet._id,
            referenceNumber: txRef,
            type: 'credit',
            amount : amount,
            currency: currency,
            balanceBefore: wallet.balance,
            balanceAfter: parseFloat(wallet.balance) + parseFloat(amount),
            description: 'Wallet funding via flutterwave',
            status: 'pending'
        })

        await newTransaction.save();

        return res.status(200).json({ message: "Redirect URL created successfully", message: "Payment link created successfully",
        paymentLink: response.data.data.link,
        txRef: txRef });

    } catch (err) {
        console.error("Error creating redirect URL", err);
        return res.status(500).json({ error: 'Internal server error', errorDetails: err.message });
    }
}


// Flutterwave Webhook handler

const flutterwaveWebhook = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        // Verify signature

        const secretHash = process.env.FLW_WEBHOOK_SECRET;
        if (!secretHash) {
            console.error("FLW_WEBHOOK_SECRET not set");
            return res.status(500).json("Internal server error")
        }

        const signature = req.headers["verif-hash"];
        if(!signature) return res.status(401).json({'message': 'Unauthorized Access'});

        console.log("secretHash:", secretHash);
        console.log("Received webhook with signature:", signature);
        // console.log("Raw request body:", req.body);

        // const hash = crypto
        // .createHmac('sha256', secret)
        // .update(req.rawBody)
        // .digest('hex');

        if((secretHash !== signature) || !signature) {
            console.error("Invalid Flutterwave signature");
            return res.status(401).json({'message' :'Unauthorized Access'});
        }
        
        
        const payload = req.body;
        console.log("Webhook payload:", payload);

        // START
        if(payload.event === 'charge.completed' && payload.data.status === 'successful') {
            const { tx_ref, amount, currency, id: transactionId } = payload.data;

            // Verify the transaction details with Flutterwave API
            const  verifyResponse = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
                headers: {
                    Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                }
            });

            console.log("Flutterwave verification response", verifyResponse.data);

            const verifyData = verifyResponse.data.data;

            if (
                verifyData.status !== 'success' ||
                verifyData.data.status !== 'successful' ||
                verifyData.data.amount !== amount ||
                verifyData.data.currency !== currency ||
                verifyData.data.tx_ref !== tx_ref
            ) {
                return res.status(400).json({ message: "Transaction verification failed" });
            }
            
            // Extract userId from tx_ref
            const txParts = tx_ref.split("-");
            const userId = txParts[txParts.length - 1];

            // Start a transaction session
            session.startTransaction();

            const transactionRecord = await Transaction.findOneAndUpdate(
                { referenceNumber: tx_ref, status: 'pending' },
                { 
                    $set: {
                        status: "processing",
                        lockedAt: new Date()
                    }
                },
                { new: true, session }
             );

            //  console.log("Transaction record after locking", transactionRecord);
             
             if (!transactionRecord) {
                await session.abortTransaction();
                const existingTransaction = await Transaction.findOne({ referenceNumber: tx_ref });

                if (existingTransaction && existingTransaction.status === 'pending') {
                    console.error("Transaction is already processed", existingTransaction.status);
                    return res.status(200).json({ message: "Transaction is already processed" });
                }
                return res.status(404).json({ message: "Transaction not found or already processed" });
             }

             const wallet = await Wallet.findOneAndUpdate(
                { _id: transactionRecord.walletId },
                {
                    $inc: { balance: amount },
                    $set: { lastUpdatedAt: new Date() }
                },
                {
                    new: true,
                    session
                }
             );

            //  console.log("User Wallet Found and Updated: ", wallet);


             if(wallet) {
                const user = await User.findById(transactionRecord.userId).session(session);

                if (user) {
                    console.log(`Wallet funded successfully for user: ${user.email}, Amount: ${amount} ${currency}`);
                }

                // Update the transaction record to completed
                await Transaction.findOneAndUpdate(
                    { referenceNumber: tx_ref },
                    {
                        $set: {
                            status: "successful",
                            completedAt: new Date(),
                            lockedAt: null
                        }
                    },
                    { new: true, session }
                )

                // Commit the transaction
                await session.commitTransaction();
                return res.status(200).json({ message: "Wallet funded successfully" });
             } else {
                console.error("Transaction verification failed: Wallet not found");
                return res.status(404).json({ message: "Wallet not found" });
             }
                    
            }
            // END

             // For other evevnts, just acknowledge receipt
             return res.status(200).json({ message: "Webhook received" });
             
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Webhook error:", err);
        return res.status(500).json({ message: "Webhook processing failed"});
    } finally {
        // End the session
        session.endSession();
    }
}

module.exports = {
    createWallet, getWallets, transferFunds, createRedirectUrl, flutterwaveWebhook
}