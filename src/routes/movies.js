const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Movie = require('../models/Movie');

//ver peliculas
router.get('/' , async (req, res) =>{
  try{
    const movies = await Movie.find();
    res.json(movies);
  }catch(error){
    console.log(error);
  }
});



// Crea una nueva película
router.post('/', async (req, res) => {
  try {
    const movie = new Movie({
      imdbid: req.body.imdbid,
      title: req.body.title,
      year: req.body.year,
      photo: req.body.photo
      
    });
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene información de una película existente
router.get('/:imdbid', async (req, res) => {
  try {
    const imdbid = req.params.imdbid;
    const movie = await Movie.findOne({ imdbid: imdbid });
    if (!movie) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    // Obtiene todas las reseñas de la película
    const reviews = await Review.aggregate([
      { $match: { movie: movie._id } },
      { $group: { _id: '$movie', avgRating: { $avg: '$rating' } } }
    ]);

    // Actualiza el rating de la película con el promedio de las reseñas
    if (reviews.length > 0) {
      movie.rating = reviews[0].avgRating;
      await movie.save();
    }

    res.json(movie);
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

    const reviews = await Review.find({ 'movie.imdbid': imdbid });
    //const reviews = await Review.find({ movie: { imdbid: imdbid } });
    //const reviews = await Review.find({ movie: imdbid });
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