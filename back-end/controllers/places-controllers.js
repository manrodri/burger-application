const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');


const getPlaceById =  async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }

  let place;
  try{
     place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError("Something went wrong, Could not find a place for this id in the database", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find a place for the provided id.', 404);
    return next(error);
  }

  res.json({ place: place.toObject( {getters: true}) });
};


const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try{
      places =  await Place.find({ creator: userId});
  }  catch (e) {
    const error = new HttpError('Fetching place failed, please try again', 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({ places: places.map( place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    creator
  });

  let user;
  try{
    user =  await User.findById(creator);
  }catch (e) {
    const error = new HttpError('Created place failed, try again', 500);
    return next(error);
  }

  if(!user){
    const error = new HttpError('User not found for provided userId', 404);
    return next(error);
  }

  console.log(user);

  try {

    const session = await mongoose.startSession(); // create session. session -> transaction => add place -> add reference to user
    session.startTransaction(); // start transaction
    await createdPlace.save({ session }); // save new place to places collection
    user.places.push(createdPlace); // add reference to new place in the places attribute of the relevant user
    await  user.save({ session }); // add new user.
    await session.commitTransaction(); // commit changes, if any of the previous statements fails changes are not commited.

  } catch (e) {
    console.log(e)
    const error = new HttpError('Created place failed, try again', 500);
    return next(error);
  }


  res.status(201).json({ place: createdPlace });
};

const updatePlace =  async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let updatedPlace;
  try{
     updatedPlace = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError("Something went wrong, Could not update a place for this id in the database", 500);
    return next(error);
  }

  updatedPlace.title = title;
  updatedPlace.description = description;

  try {
    await updatedPlace.save();
  } catch (e) {
    const error = new HttpError("Something went wrong, Could not upload updated place to the database", 500);
    return next(error);
  }

  res.json({ place: updatedPlace.toObject( {getters: true}) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
     place = await Place.findById(placeId).populate('creator');

  } catch (e) {
    const error = new HttpError("Something went wrong, Could not delete place", 500);
    return next(error);
};

  if(!place){
    const error = new HttpError("Something went wrong, Could not find place", 404);
    return next(error)
  }

  // delete place
  try{

    const session = await mongoose.startSession();
    session.startTransaction();
    place.remove({ session });
    // find user who created this place and remove place from places
    place.creator.places.pull(place); // this comes out of the box with mongoose.
    await place.creator.save({ session });
    await session.commitTransaction();

  } catch (e) {

    const error = new HttpError("Something went wrong, Could not delete place", 500);
    return next(error);
  }
  res.status(200).json({});
}



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
