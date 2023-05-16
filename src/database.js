const mongoose = require('mongoose');
const moviesData = require('./moviesData.json');
const Movie = require('./models/Movie');

const URI = process.env.MONGODB_URI
  ? process.env.MONGODB_URI
  : 'mongodb://127.0.0.1:27017/movie-rating-app';

mongoose.connect(
  URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => {
    console.log('Conectado a MongoDB');
  })
  .catch((error) => {
    console.error(error);
  });

const connection = mongoose.connection;

connection.once('open', async () => {
  console.log('La base de datos está conectada');
  // Insertar películas en la base de datos
  /*for (const movieData of moviesData) {
    const movie = new Movie({
      imdbid: movieData.imdbid,
      title: movieData.title,
      year: movieData.year,
      image: movieData.image
    });
    await movie.save();
    console.log(`Película "${movie.title}" insertada en la base de datos`);
  }
    // Consultar películas en la base de datos
    /*const movies = await Movie.find();
    console.log('Películas en la base de datos:', movies);*/


  // Eliminar documentos duplicados por imdbid
  const cursor = Movie.aggregate([
    { $group: { _id: "$imdbid", uniqueIds: { $addToSet: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
 ]).cursor({ batchSize: 1000 });

 await cursor.eachAsync(async function(doc) {
    doc.uniqueIds.shift();
    await Movie.deleteMany({_id: {$in: doc.uniqueIds}});
 });
  //mongoose.connection.close();

  // Aquí es donde puedes hacer tus consultas
  // después de que se haya establecido la conexión

});
