const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  naam: {
    type: String,
    required: [true, 'Een product moet een naam hebben'],
    unique: true,
    trim: true,
  },
  slug: String,
  kleur: {
    type: String,
    required: [true, 'Een product moet een kleur hebben'],
  },
  categorie: {
    type: String,
    required: [true, 'Een product moet een categorie hebben'],
  },
  prijs: {
    type: Number,
    required: [true, 'Een product moet een prijs hebben'],
  },
  aantal: {
    type: Number,
    required: [true, 'Een product moet een aantal hebben'],
    default: 1,
  },
  maat: {
    type: String,
    default: 'm',
  },
  afbeelding: {
    type: String,
  },
  beschrijving: {
    type: String,
    default: 'prachtig product',
  },
  gereserveerd: {
    type: Boolean,
    default: false,
  },
  gemaaktOp: {
    type: Date,
    default: Date.now(),
  },
});

// Document middleware: runs voor .save() en .create()
productSchema.pre('save', function (next) {
  this.slug = slugify(this.naam, { lower: true });
  next();
});

// Query middleware: runs voor find
productSchema.pre(/^find/, function (next) {
  this.find({ gereserveerd: { $ne: true } });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
