const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userConrollers = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware')
// const {registerRules, loginRules, validator} = require('../middlewares/validator')
// const userModel = require('../models/user.model')


router.post('/register', [
    body('email').isEmail().withMessage('invalid email'),
    body('fullname.firstname').isLength({min:3}).withMessage('first name must be at least 3 character long'),
    body('password').isLength({min:6}).withMessage('password must be at least 6 character long ')
    
],
userConrollers.registerUser
)




router.post('/login', [
    body('email').isEmail().withMessage('invalid email'),
    body('password').isLength({min:6}).withMessage('password must be at least 6 character long ')
],
userConrollers.loginUser
);


router.get('/profile',authMiddleware.authUser, userConrollers.getUserProfile);

router.get('/logout',authMiddleware.authUser, userConrollers.logoutUser);



module.exports = router;