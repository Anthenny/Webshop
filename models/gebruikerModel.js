const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

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
  adress: {
    type: String,
    required: [true, 'Elke gebruiker moet een adress hebben'],
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
  winkelmand: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        hoeveelheid: { type: Number, required: true },
      },
    ],
  },
  actief: {
    type: Boolean,
    default: true,
    select: false,
  },
  wachtwoord: {
    type: String,
    required: [true, 'Een gebruiker moet een wachtwoord hebben'],
    minlength: 1,
    select: false,
  },
  wachtwoordVeranderdOp: {
    type: Date,
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

// Document middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('wachtwoord')) return next();

  this.wachtwoord = await bcrypt.hash(this.wachtwoord, 12);
  this.bevestigWachtwoord = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('wachtwoord') || this.isNew) return next();

  this.wachtwoordVeranderdOp = Date.now() - 1000;
  next();
});

// Query middleware
userSchema.pre(/^find/, function (next) {
  //this wijst naar huidige query
  this.find({ actief: { $ne: false } });
  next();
});

// Methods
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

  this.wachtwoordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
