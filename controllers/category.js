const Category = require('../models/category');
const { errorHandler } = require('../helpers/dbErrorHandler');



/*======= Get CategoryById Controller Method ==============*/
exports.categoryById = (req, res, next, id) => {
	Category.findById(id).exec((err, category) => {
		if (err || !category) {
			return res.status(400).json({
				error: 'Category Not Found!!!'
			});
		}
		req.category = category;
		next();
	});
};


/*======= Get All Categories Controller Method ==============*/

exports.list = (req, res) => {
	Category.find().exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json(data);
	});
};


/*======= Read Single CategoryById Controller Method ==============*/
exports.read = (req, res) => {
	return res.json(req.category);
}



/*======= Create New Category Controller Method ==============*/
exports.create = (req, res) => {
	const category = new Category(req.body);
	category.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler(err)
			});
		}
		res.json({ data });
	});
};



/*======= Update Category Controller Method ==============*/
exports.update = (req, res) => {
	const category = req.category;
	category.name = req.body.name;
	category.save((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler
			});
		}
		res.json(data);
	});
};


/*======= Delete Category Controller Method ==============*/
exports.remove = (req, res) => {
	const category = req.category;
	category.remove((err, data) => {
		if (err) {
			return res.status(400).json({
				error: errorHandler
			});
		}
		res.json({message: 'Category has been Deleted Successfully!!!'});
	});
};