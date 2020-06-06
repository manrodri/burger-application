const uuid = require('uuid/v4');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, "-password");
    } catch (e) {
        const error = new HttpError("Fetching user failed, please try again", 500);
        return next(error);
    }

    return res.json({
        users: users.map(u => {
            return u.toObject({getters: true});
        })
    });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }
    const {name, email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (e) {
        const error = new HttpError("Singing up user failed, please try again", 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError("Login failed", 400);
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password, // we need to encrypt this
        image: 'https://images.unsplash.com/photo-1518655061710-5ccf392c275a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
        // dummy image
        places: []
    })

    try {
        await createdUser.save();
    } catch (e) {
        const error = new HttpError("Something went wrong, Could not add user to the database", 500);
        return next(error);
    }

    res.status(201).json({user: createdUser.toObject({getters: true})});
};

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({email: email});
    } catch (e) {
        const error = new HttpError("Login up user failed, please try again", 500);
        return next(error);
    }


    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Could not identify user, credentials seem to be wrong.', 401);
        return next(error);
    }

    res.json({message: 'Logged in!'});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
