const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  naam: {
    type: String,
    required: [true, 'Een gebruiker moet een naam hebben'],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, 'Een gebruiker moet een email hebben'],
    lowercase: true,
    validate: [validator.isEmail, ['Gebruik aub een juist email adress']],
    unique: true,
  },
  adres: {
    type: String,
    required: [true, 'Elke gebruiker moet een adres hebben'],
  },
  plaats: {
    type: String,
    required: [true, 'Elke gebruiker moet een plaats hebben'],
  },
  rol: {
    type: String,
    enum: ['gebruiker', 'admin'],
    default: 'gebruiker',
  },
  wachtwoord: {
    type: String,
    required: [true, 'Een gebruiker moet een wachtwoord hebben'],
    minlength: 1,
    select: false,
  },
  wachtwoordResetToken: {
    type: String,
  },
  wachtwoordResetExpires: {
    type: Date,
  },
  bevestigWachtwoord: {
    type: String,
    required: [true, 'Bevestig uw wachtwoord'],
    validate: {
      // Dit werkt alleen op create en save!
      validator: function (el) {
        return el === this.wachtwoord;
      },
      message:
        'Het bevestigde wachtwoord moet overeenkomen met het wachtwoord!',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('wachtwoord')) return next();

  this.wachtwoord = await bcrypt.hash(this.wachtwoord, 12);
  this.bevestigWachtwoord = undefined;
});

userSchema.methods.correctWachtwoord = async function (
  ingevuldWachtwoord,
  gebruikerWachtwoord
) {
  return await bcrypt.compare(ingevuldWachtwoord, gebruikerWachtwoord);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.wachtwoordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken });
  console.log(this.wachtwoordResetToken);

  this.wachtwoordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
