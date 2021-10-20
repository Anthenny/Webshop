const express = require('express');
const authController = require('../controllers/authController');
const gebruikerController = require('../controllers/gebruikerController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/wachtwoordVergeten', authController.forgotWachtwoord);
router.post('/resetWachtwoord', authController.resetWachtwoord);

router.get('/', gebruikerController.getAllGebruikers);

module.exports = router;
