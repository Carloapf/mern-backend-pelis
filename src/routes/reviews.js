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
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });

    }
    const user = await User.findOne({ name: userName });
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
router.get('/movie/:imdbid', async (req, res) => {
  try {
    const imdbid = req.params.imdbid;
    const movie = await Movie.findOne({ imdbid: imdbid });
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    const reviews = await Review.find({ movie: movie._id }).populate('user');

    //
    //const reviews = await Review.find({ movie: { imdbid: imdbid } }).populate('user');
    //const reviews = await Review.find({ movie: movieId }).populate('user');
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene el rating promedio de una película
router.get('/movie/:imdbid/average-rating', async (req, res) => {
  try {/*
    const imdbid = req.params.imdbid;
    const result = await Review.aggregate([
      {
        $lookup: {
          from: 'movies',
          localField: 'movie',
          foreignField: '_id',
          as: 'movie'
        }
      },
      {
        $unwind: '$movie'
      },
      {
        $match: { 'movie.imdbid': imdbid }
      },
      {
        $group: {
          _id: "$movie.imdbid",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    const averageRating = result[0].averageRating;
    res.json({ averageRating });

    */

    // Encuentra la película por imdbid
    const imdbid = req.params.imdbid;
    const movie = await Movie.findOne({ imdbid: imdbid });

    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    // Obtiene el rating promedio de la película
    const result = await Review.aggregate([
      {
        $match: { movie: new mongoose.Types.ObjectId(movie._id) }
      },
      {
        $group: {
          _id: "$movie",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    // Actualiza el campo de averageRating en la película
    movie.averageRating = result[0].averageRating;

    // Guarda la película actualizada en la base de datos
    await movie.save();

    // Envía la respuesta con la película actualizada
    res.json(movie);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;