const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const User = require('../models/Users');
const Review = require('../models/review');

// Crea una nueva reseña
router.post('/', async (req, res) => {
  try {
    const imdbid  = req.body.imdbid ;
    const userName = req.body.userName;
    const rating = req.body.rating;

    const movie = await Movie.findOne({ imdbid: imdbid });
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });

    }
    const user = await User.findOne({ name: userName });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const existingReview = await Review.findOne({ movie: movie._id, user: user._id });
    if (existingReview) {
      return res.status(400).json({ error: 'Ya has reseñado esta película' });
    }

    const review = new Review({
      movie: movie._id,
      user: user._id,
      rating: rating
    });
    await review.save();

    const reviews = await Review.find({ movie: movie._id });
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings / reviews.length;

    await Movie.updateOne({ _id: movie._id }, { $set: { averageRating: averageRating } });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene todas las reseñas de una película
router.get('/:imdbid', async (req, res) => {
  try {
    const imdbid = req.params.imdbid;
    const movie = await Movie.findOne({ imdbid: imdbid });
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    const reviews = await Review.find({ movie: movie._id }).populate('user');

    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualiza la calificación promedio de una película
router.put('/:imdbid/rating', async (req, res) => {
  try {
    const imdbid = req.params.imdbid;
    const movie = await Movie.findOne({ imdbid: imdbid });
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const reviews = await Review.find({ movie: movie._id });
    const ratings = reviews.map(review => review.rating);
    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    const averageRating = total / ratings.length;

    movie.rating = averageRating;
    await movie.save();

    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;