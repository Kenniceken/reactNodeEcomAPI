const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Product = require('../models/product');
const { errorHandler } = require('../helpers/dbErrorHandler');





/*=============== Get Product By ID Controller Method =================================*/

exports.productById = (req, res, next, id) => {
	Product.findById(id)
		.populate('category')
		.exec((err, product) => {
		if (err || !product) {
			return res.status(400).json({
				error: 'Product not Found!!!'
			});
		}
		req.product = product
		next();
	});
};



/*=========================== Read/Show Single Product Controller Method =========================*/

exports.read = (req, res) => {
	req.product.photo = undefined;
	return res.json(req.product);
}



/*=========================== Create Product Controller Method =================================*/

exports.create = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: 'Something Went wrong, Image could not be uploaded!!!'
			});
		}

		// verify fields
		const { name, description, price, category, quantity, shipping } = fields;
		if (
			!name ||
			!description ||
			!price ||
			!category ||
			!quantity ||
			!shipping) {
				return res.status(400).json({
					error: 'All fields are Required!!!'
				});
		}

		let product = new Product(fields);
		/*
			Image Sizes in kb
			1kb = 1000
			1mb = 1000000
		*/

		if (files.photo) {
			//console.log('FILES PHOTO', files.photo);
				if (files.photo.size > 1000000) {
					return res.status(400).json({
					error: 'Image cannot be more than 1mb in size!!!'
				});
			};

			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}
		product.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json({ result });
		});
	});
};

/*=========================== Delete Product Controller Method =========================*/
exports.remove = (req, res) => {
	let product = req.product;
	product.remove((err, deletedProduct) => {
		if (err) {
			return res.status(400).json({
					error: errorHandler(err)
				});
		}
		res.json({
			"message": "Product has been Deleted Successfully"
		});
	});
};

/*=========================== Update Product Controller Method =========================*/
exports.update = (req, res) => {
	let form = new formidable.IncomingForm();
	form.keepExtensions = true;
	form.parse(req, (err, fields, files) => {
		if (err) {
			return res.status(400).json({
				error: 'Something Went wrong, Image could not be uploaded!!!'
			});
		}

		// verify fields
		// const { name, description, price, category, quantity, shipping } = fields;
		// if (
		// 	!name ||
		// 	!description ||
		// 	!price ||
		// 	!category ||
		// 	!quantity ||
		// 	!shipping) {
		// 		return res.status(400).json({
		// 			error: 'All fields are Required!!!'
		// 		});
		// }

		let product = req.product;
		product = _.extend(product, fields);
		/*
			Image Sizes in kb
			1kb = 1000
			1mb = 1000000
		*/

		if (files.photo) {
			//console.log('FILES PHOTO', files.photo);
				if (files.photo.size > 1000000) {
					return res.status(400).json({
					error: 'Image cannot be more than 1mb in size!!!'
				});
			}

			product.photo.data = fs.readFileSync(files.photo.path);
			product.photo.contentType = files.photo.type;
		}
		product.save((err, result) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				});
			}
			res.json({ result });
		});
	});
};

/* *
** on Sale / New Arrival
*  by sale =  /products?sortBy=sold&order=desc&limit=5
* New Arrival =  /products?sortBy=createdAt&order=desc&limit=5
* if no params are sent, it means all products are returned..
 */

exports.list = (req, res) => {
	let order = req.query.order ? req.query.order : 'asc';
	let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	Product.find()
		.select('-photo')
		.populate('category')
		.sort([[sortBy, order]])
		.limit(limit)
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: 'Product not Found'
				});
			}
			res.send(products);
		});
};


/*
* This method will fetch products based on the req product category
* other products that has the same category will be returned
*/
exports.relatedProducts = (req, res) => {
	let limit = req.query.limit ? parseInt(req.query.limit) : 6;

	Product.find({_id: {$ne: req.product}, category: req.product.category})
		.limit(limit)
		.populate('category', '_id name')
		.exec((err, products) => {
			if (err) {
				return res.status(400).json({
					error: 'No Related Products Found'
				});
			}
			res.json(products);
		});
};

exports.listProductsByCategories = (req, res) => {
	Product.distinct('category', {}, (err, categories) => {
		if (err) {
			return res.status(400).json({
				error: 'No Product Found in This Product Category'
			});
		}
		res.json(categories);
	});
};


/*
* Products By Search will fetch all products by either checkbox categories or price range or radio button
* An api Request call will be made as soon as any of these options are clicked or checked by users in
* the frontend react
* */


exports.productsBySearch = (req, res) => {
	let order = req.body.order ? req.body.order : 'desc';
	let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
	let limit = req.body.limit ? parseInt(req.body.limit) : 100;
	let skip = parseInt(req.body.skip);
	let findArgs = {};

	//console.log(order, sortBy, limit, skip, req.body.filters);
	//console.log('findArgs', findArgs);

	for (let key in req.body.filters) {
		if (req.body.filters[key].length > 0) {
			if (key === 'price') {
				// gte - greater than price [0-10]
				//lte - less than
				findArgs[key] = {
					$gte: req.body.filters[key][0],
					$lte: req.body.filters[key][1]
				};
			} else {
				findArgs[key] = req.body.filters[key];
			}
		}
	}

	Product.find(findArgs)
		.select('-photo')
		.populate('category')
		.sort([[sortBy, order]])
		.skip(skip)
		.limit(limit)
		.exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: 'No Product Found'
				});
			}
			res.json({
				size: data.length,
				data
			});
		});
};

exports.photo = (req, res, next) => {
	if (req.product.photo.data) {
		res.set('Content-Type', req.product.photo.contentType);
		return res.send(req.product.photo.data);
	}
	next();
};

exports.listSearch = (req, res) => {
	// create query object to hold search value and category value
	const query = {}

	// assign search value to query.name
	if (req.query.search) {
		query.name = {$regex: req.query.search, $options: 'i'}

		// assign category value to query.category
		if (req.query.category && req.query.category != 'All') {
			query.category = req.query.category
		}

		// find product based on query object with 2 properties
		// search and category queries
		Product.find(query, (err, products) => {
			if (err) {
				return res.status(400).json({
					error: errorHandler(err)
				})
			}
			res.json(products)
		}).select('-photo')
	}
};

exports.decreaseProductQuantity = (req, res, next) => {
	let bulkOps = req.body.order.items.map((item) => {
		return {
			updateOne: {
				filter: { _id: item._id},
				update: { $inc: {quantity: -item.count, sold: +item.count}}
			}
		};
	});

	Product.bulkWrite(bulkOps, {}, (error, items) => {
		if (error) {
			return res.status(400).json({
				error: 'Something Went Wrong, Could not Update Product Stock Quantity'
			});
		}
		next();
	});
};
