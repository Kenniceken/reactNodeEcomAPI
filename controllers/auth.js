const User = require('../models/user');
const jwt = require('jsonwebtoken'); // used to generate login token
const expressJwt = require('express-jwt'); // used for Authorization verification

const { errorHandler } = require('../helpers/dbErrorHandler');


/** This is Signup Controller Method
==================================================================================
*/
exports.register = (req, res) => {
	//console.log('req.body', req.body);
	const user = new User(req.body);
	user.save((err, user) => {
		if (err) {
			return res.status(400).json({
				err: errorHandler(err)
			});
		}
		user.salt = undefined;
		user.hashed_password = undefined;
		res.json({
			user
		});
	});
};


/** This is Login Controller Method
==================================================================================
*/

exports.login = (req, res, next) => {
	// finding user based on email ID
	const { email, password} = req.body
	User.findOne({ email }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({
				error: "Opps!!! Email doest not Exist.. Please Signup!!.."
			});
		}
		// if user is found, verify that the email and password does match..
		// Create authenticate metho in the user model
		if (!user.authenticate(password)) {
			return res.status(401).json({
				error: 'Opps!!.. Email or Password Invalid, Please Try Again Later!!!..'
			});
		}

		// Generate a login token with user id and secret
		const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
 
		//persist the token as 'k' in cookie with an expiry date
		res.cookie('k', token, {expire: new Date() + 9999});

		// return response with user and token to frontend client side
		const { _id, name, email, role } = user;
		return res.json({ token, user: { _id, email, name, role }});
	})
};


/** This is Logout Controller Method
==================================================================================
*/

exports.logout = (req, res) => {
	res.clearCookie('k');
	res.json({ message: 'You have Successfully Logged Out!!!'});
}


/** Protected Route Method for Require Login, Require Login Method
==================================================================================
*/

exports.requireLogin = expressJwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'auth'
});


/** Protected Route Method isAuthenticated User
==================================================================================
*/

exports.isAuth = (req, res, next) => {
	let user = req.profile && req.auth && req.profile._id == req.auth._id;
		if (!user) {
			return res.status(400).json({
				error: 'Access Denied!!!'
			});
		}

	next();
};

/** Protected Route Method isAuthenticated and isAdmin
==================================================================================
*/

exports.isAdmin = (req, res, next) => {
	if (req.profile.role === 0) {
		return res.status(403).json({
			error: 'Oppss!!!! Admin only Please... Access Denied!!!'
		});
	}
	next();
};