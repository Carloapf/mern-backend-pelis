const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    user: {
      type: String,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  });
  
  module.exports = model('Review', reviewSchema);