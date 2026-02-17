const router = require('express').Router();
const isAuth = require('../config/auth');

const { createWallet, getWallets, transferFunds, createRedirectUrl, flutterwaveWebhook } = require('../controller/wallet.controller');

router.post('/create-wallet', isAuth, createWallet);
router.get('/get-wallets', isAuth, getWallets);
router.put('/transfer-funds', isAuth, transferFunds);
router.post('/create-payment-link', isAuth, createRedirectUrl);
router.post('/flutterwave-webhook', flutterwaveWebhook);

module.exports = router;