const express = require('express');
const cors = require('cors');


const app = express();
//const __dirname = dirname(fileURLToPath(import.meta.url))

// settings
app.set('port', process.env.PORT || 4000);

// middlewares
app.use(cors());
app.use(express.json());

//routes
app.get('/users',(req, res) => res.send('Users Routes'))
app.use('/api/users',require('./routes/users'));
app.use('/api/movies',require('./routes/movies'));
app.use('/api/reviews',require('./routes/reviews'));
//app.use('/api/users', require('./routes/users'))
//app.use('/api/notes', require('./routes/notes'))

//console.log(__dirname)
//app.use(express.static())

module.exports = app;