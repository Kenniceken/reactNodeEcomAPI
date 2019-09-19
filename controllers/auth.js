const User = require('../models/user');
const jwt = require('jsonwebtoken'); // used to generate login token
const expressJwt = require('express-jwt'); // used for Authorization verification
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const _ = require('lodash');

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


// forgotPassword & resetPassword methods
exports.forgotPassword = (req, res) => {
	if (!req.body) return res.status(400).json({ message: "No Email Sent" });
	if (!req.body.email)
		return res.status(400).json({ message: "Email Field cannot be empty" });

	console.log("forgot password finding user with that email");
	const { email } = req.body;
	console.log("login req.body", email);
	// find the user based on email
	User.findOne({ email }, (err, user) => {
		// if err or no user
		if (err || !user)
			return res.status("401").json({
				error: "User with that email does not exist!"
			});

		// generate a token with user id and secret
		const token = jwt.sign(
			{ _id: user._id, iss: "REACTNODEECOM" },
			process.env.JWT_SECRET
		);

		// email data
		const emailResetData = {
			from: "noreply@nlaxstore.com",
			to: email,
			subject: "Password Reset Instructions",
			text: `Please use the following link below to reset your password: ${
				process.env.CLIENT_URL
			}/reset-password/${token}`,
			html: `<p>Please use the following link to reset your password:</p> <p>${
				process.env.CLIENT_URL
			}/reset-password/${token}</p>`
		};

		return user.updateOne({ resetPasswordLink: token }, (err, success) => {
			if (err) {
				return res.json({ message: err });
			} else {
				sgMail.send(emailResetData);
				return res.status(200).json({
					message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
				});
			}
		});
	});
};

// To Allow users to reset their password
// First we will find the User in the Database with the user's resetPasswordLink
// User model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we have the right user

exports.resetPassword = (req, res) => {
	const { resetPasswordLink, newPassword } = req.body;

	User.findOne({ resetPasswordLink }, (err, user) => {
		// if err or no user
		if (err || !user)
			return res.status("401").json({
				error: "Invalid Link!"
			});

		const updatedFields = {
			password: newPassword,
			resetPasswordLink: ""
		};

		user = _.extend(user, updatedFields);
		user.updated = Date.now();

		user.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: err
				});
			}
			res.json({
				message: `Success! Password has been Successfully Reset, Please Login with your new Password.`
			});
		});
	});
};
