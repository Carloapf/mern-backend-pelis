const express = require('express');
const router = express.Router();
const User = require('../models/Users');

//ver usuarios
router.get('/' , async (req, res) =>{
  try{
    const users = await User.find();
    res.json(users);
  }catch(error){
    console.log(error);
  }
});

// Crea un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const user = new User({
      name: req.body.name
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtiene información de un usuario existente
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error){
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;