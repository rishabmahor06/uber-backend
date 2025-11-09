const express = require('express');
const router = express.Router();
const { body}= require('express-validator');
const captainController = require('../controllers/captain.controller');
const registerCaptain = require('../controllers/captain.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const logoutCaptain = require('../controllers/captain.controller')



router.post('/register', [
    body('email').isEmail().withMessage('invalid email'),
    body('fullname.firstname').isLength({min:3}).withMessage('firstname must be at least 3 character long'),
    body('password').isLength({min:6}).withMessage('passowrd must be at least 6 character long'),
    body('vehicle.color').isLength({min:3}).withMessage('color must be at least 3 character long'),
    body('vehicle.plate').isLength({min:3}).withMessage('plate must be at least 3 character long'),
    body('vehicle.capacity').isInt({min:1}).withMessage('capacity must be at least 1 character long'),
    body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('invalid must be at least 1 character long'),







], captainController.registerCaptain);




router.post('/login',[
  body('email').isEmail().withMessage('invalid email'),
  body('password').isLength({min:6}).withMessage('password must be 6 character long ')
], captainController.loginCaptain)



router.get('/profile', authMiddleware.authCaptain, captainController.getCaptainProfile);


router.get('/logout', authMiddleware.authCaptain, captainController.logoutCaptain);




module.exports = router;







/*
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// import captain controller (not user.controller!)
const captainController = require('../controllers/captain.controller');

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('fullname.firstname')
      .isLength({ min: 3 })
      .withMessage('Firstname must be at least 3 characters long'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('vehicle.color')
      .isLength({ min: 3 })
      .withMessage('Color must be at least 3 characters long'),
    body('vehicle.plate')
      .isLength({ min: 3 })
      .withMessage('Plate must be at least 3 characters long'),
    body('vehicle.capacity')
      .isInt({ min: 1 })
      .withMessage('Capacity must be at least 1'),
    body('vehicle.vehicleType')
      .isIn(['car', 'motorcycle', 'auto'])
      .withMessage('Invalid vehicle type'),
  ],
  captainController.registerCaptain // ✅ must point to a function
);

module.exports = router;
 */