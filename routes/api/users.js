const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check')

const User = require('../../models/User');



// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', 
    [
        // Add in CHECKS for values users put into form
        // parameters: parameter name, message, condition. 
        // User check 1
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        // User check 2    
        check('email', 'Please include a valid email').isEmail(),
        // User check 3
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        // destructure req.body and pull out fields. 
        const { name, email, password } = req.body; 

        try {
        // See if User exists
            let user = await User.findOne({ email });
            if (user) {
                return res
                    .status(400)
                    .json({ errors: [ { msg: 'User already exists'} ] });
            }

        // Get users gravatar -> pass users email into method to get url of users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            });


        // Encrypt password using bcrypt
        const salt = await bcrypt.genSalt(10); // create salt, prerequisite for hashing function
        user.password = await bcrypt.hash(password, salt) // apply hash function
        await user.save();

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


        //res.send('User registered');

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router; 