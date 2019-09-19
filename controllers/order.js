const { Order, CartItem } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');


exports.orderById = (req, res, next, id) => {
    Order.findById(id)
        .populate('items.item', 'name price')
        .exec((err, order) => {
            if (err || !order) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            req.order = order;
            next();
        });
};

exports.create = (req, res) => {
   // console.log('CREATE ORDER', req.body);
    req.body.order.user = req.profile;
    const order = new Order(req.body.order);
    order.save((error, data) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            });
        }
        //send email alert to the Admin Email
        // order.address
        //order.items.length
        //order.amount
        const orderEmailData = {
          to: 'kennyresume@gmail.com',
          from: 'noreply@laxstore.com',
          subject: `A New Order has been Received`,
          html:
              `
              <p>Customer Name: ${order.user.name}</p>
              <p>Total Items: ${order.items.length}</p>
              <p>Total Cost: ${order.amount}</p>
              <p>Login to Admin Home to View Order Details.</p>              
              `
        };
        sgMail.send(orderEmailData);
        res.json(data);
    })

};

exports.listOrders = (req, res) => {
    Order.find()
        .populate("user", "_id name address")
        .sort("-created")
        .exec((err, orders) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(orders);
        });
};

exports.getOrderStatusValues = (req, res) => {
    res.json(Order.schema.path('status').enumValues);
};



exports.updateOrderStatus = (req, res) => {
    Order.update(
        { _id: req.body.orderId },
        { $set: { status: req.body.status } },
        (err, order) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json(order);
        }
    );
};



