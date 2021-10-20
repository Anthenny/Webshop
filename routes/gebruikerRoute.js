const express = require('express');
const authController = require('../controllers/authController');
const gebruikerController = require('../controllers/gebruikerController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/wachtwoordVergeten', authController.forgotWachtwoord);
router.patch('/resetWachtwoord/:token', authController.resetWachtwoord);

router.patch(
  '/updateMijnWachtwoord',
  authController.protect,
  authController.updateWachtwoord
);

router.patch(
  '/updateMij',
  authController.protect,
  gebruikerController.updateMij
);

router.delete(
  '/deleteMij',
  authController.protect,
  gebruikerController.deleteMij
);

router.get('/', gebruikerController.getAllGebruikers);

module.exports = router;
