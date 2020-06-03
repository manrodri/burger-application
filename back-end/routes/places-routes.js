const express = require('express');

const router = express.Router();

const DUMMY_PLACES = [{
    id: 'p1',
    title: 'Empire State Building',
    description: 'One of the most famous skyscrapers in the world',
    location: {
        lat: '40.7484405',
        lng: '-73.9878531'
    },
    address: '20 W 34th St, New York, NY 10001, United States',
    creator: 'u1'
},
    {
        id: 'p2',
        title: 'Playa de la Caleta',
        description: "One of the most beautiful city beaches in the world",
        location: {
        lat: '36.5302995',
        lng: '-6.3073145'
    },
    address: 'Avenida Duque de Najera, Cadiz, 11002, Spain',
        creator: 'u2'
    }]


router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    const error = new Error('Could not find a place for the provided id.');
    error.code = 404;
    throw error;
  }

  res.json({ place }); // => { place } => { place: place }
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;

  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId;
  });

  if (!place) {
    const error = new Error('Could not find a place for the provided user id.');
    error.code = 404;
    return next(error);
  }

  res.json({ place });
});

module.exports = router;