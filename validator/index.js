exports.userSignupValidator = (req, res, next) => {

	//Check Name Field

	req.check('name', 'Field Name is Required').notEmpty();

	//Check Name Field
	req.check('email', 'Email Field is Required and must be between 3 to 50 Characters')
	.matches(/.+\@.+\..+/)
	.withMessage('Email must be a valid format')
	.isLength({	min: 4,	max: 50	});

	// password match check
	req.check("password", "Password is Required").notEmpty();
	req.check("password")
	.isLength({ min: 6 })
	.withMessage("Password must contain at least 6 characters")
	.matches(/\d/)
	.withMessage("Password Must contain at least a number");


	//check for errors
	 const errors = req.validationErrors();

	 //show errors in order they happen
	 if (errors) {
	 	const firstError = errors.map((error) => error.msg)[0]
		return res.status(400).json({ error: firstError });
	 }

	 //proceed to middleware
	 next();
};