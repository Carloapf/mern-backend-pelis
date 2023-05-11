const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const User = require('../models/Users');
const Review = require('../models/review');

// Crea una nueva reseña
router.post('/', async (req, res) => {
  try {
    const movieId = req.body.movieId;
    const userName = req.body.userName;
    const rating = req.body.rating;

    const movie = await Movie.findById(movieId);
    if (!movie){
        return res.status(404).json({ error: 'Película no encontrada' });

    }
    const user = await User.findOne({name: userName});
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const existingReview = await Review.findOne({ movie: movieId, user: user._id });
    if (existingReview) {
      return res.status(400).json({ error: 'Ya has reseñado esta película' });
    }

    const review = new Review({
      movie: movieId,
      user: user._id,
      rating: rating
    });
    await review.save();

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene todas las reseñas de una película
router.get('/movie/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const reviews = await Review.find({ movie: movieId }).populate('user');
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene el rating promedio de una película
router.get('/movie/:movieId/average-rating', async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const result = await Review.aggregate([
      {
        $match: { movie: new mongoose.Types.ObjectId(movieId) }
      },
      {
        $group: {
          _id: "$movie",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    const averageRating = result[0].averageRating;
    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;