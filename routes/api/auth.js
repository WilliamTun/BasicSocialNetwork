const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check')

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        // return the details of the AUTHENTICATED user [note the auth parameter above]
        const user = await User.findById(req.user.id).select('-password');
        res.json(user); 
    } catch (err) {
        // If something goes wrong with returning data of authenticated user
        // return the following error messages.
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});


// @route   POST api/auth
// @desc    Authenticate User and get token
// @access  Public
router.post('/', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Password is required'
        ).exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        // destructure req.body and pull out fields. 
        const { email, password } = req.body; 

        try {
            // See if User exists
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [ { msg: 'Invalid credentials'} ] });
            }

            
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res 
                    .status(400)
                    .json({ errors: [ { msg: 'Invalid credentials'} ] });
            }


            // Return jsonwebtoken -> in frontend, user will be logged In via jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            // sign the token
            jwt.sign(
                payload, 
                config.get('jwtSecret'), // secret
                { expiresIn: 360000},   // expiration 
                (err, token) => {        // callback to return either token or error
                  if(err) throw err;  // if error, throw error
                  res.json({ token }) // else, return token to client. 
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router; 