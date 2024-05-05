import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productsModel.js";
import Cart from "../models/cartModel.js";


const laodOrders = async (req, res) => {
    try {
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const totalCount = await Order.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / limit);

        const ordersData = await Order.find({ user: userId }).skip(skip).limit(limit);

        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;

        res.render("orders", { user: userData, orders: ordersData, cartCount: cartItemCount, currentPage: page, totalPages: totalPages })

    } catch (error) {
        console.error(error);
    }
}


const loadOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id;
        console.log(orderId);
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });

        const orderData = await Order.findOne({ orderId: orderId }).populate("user");

        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;
        // console.log(orderData)
        res.render("order-details", { user: userData, order: orderData, cartCount: cartItemCount });

    } catch (error) {
        console.error(error);
    }
}


const cancelOrder = async (req, res) => {
    try {

        console.log("cancel order")
        const { cancellationReason, productId, orderId } = req.body;
        console.log(cancellationReason, productId, orderId);

        const updatedOrder = await Order.findOneAndUpdate(
            { user: req.session._id, orderId: orderId, "items.product_id": productId },
            {
                $set: {
                    'items.$.status': "Cancelled",
                    'items.$.reason': cancellationReason
                }
            },
            { new: true }
        );

        const cancelledProduct = updatedOrder.items.find(item => item.product_id.toString() === productId);
        const cancelledQuantity = parseInt(cancelledProduct.quantity);

        await Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity: cancelledQuantity } }
        );

        console.log(updatedOrder);
        res.status(200).json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const returnOrder = async (req, res) => {
    try {
        console.log("return order")
        const { productId, orderId, returnReason } = req.body;
        req.session.reason = returnReason;
        console.log(productId, orderId, returnReason);

        const updatedOrder = await Order.findOneAndUpdate(
            { user: req.session._id, orderId: orderId, "items.product_id": productId },
            { $set: { 'items.$.return_approval': 1, 'items.$.reason': returnReason } },
            { new: true }
        );

        console.log(updatedOrder);

        res.status(200).json({ message: 'Order returned successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}


const loadAdminOrders = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalCount = await Order.countDocuments();
        const totalPages = Math.ceil(totalCount / limit);
        const ordersData = await Order.find().populate("user").skip(skip).limit(limit);

        res.render("orders", { orders: ordersData, currentPage: page, totalPages: totalPages });

    } catch (error) {
        console.error(error);
    }
}


const loadAdminOrderDetails = async (req, res) => {
    try {
        const orderId = req.query.id;
        console.log("order id:", orderId);
        const orderData = await Order.findOne({ orderId: orderId }).populate("user");
        // console.log(orderData)
        const orderStatus = ["Confirmed", "Shipped", "Cancelled", "Delivered"]
        res.render("order-details", { order: orderData, status: orderStatus });
    } catch (error) {
        console.error(error);
    }
}


const changeOrderStatus = async (req, res) => {
    try {
        console.log("hello");
        const { orderId, productId, status } = req.body;

        console.log(orderId, productId, status);
        const updatedOrder = await Order.findOneAndUpdate(
            {
                orderId: orderId,
                'items.product_id': productId
            },
            { $set: { 'items.$.status': status } },
            { new: true }
        );

        if (status == "Cancelled") {
            const cancelledProduct = updatedOrder.items.find(item => item.product_id.toString() === productId);
            const cancelledQuantity = parseInt(cancelledProduct.quantity);

            await Product.findOneAndUpdate(
                { _id: productId },
                { $inc: { quantity: cancelledQuantity } }
            );
        }


        res.status(200).json({});
    } catch (error) {

        res.status(500).json({ error: 'Failed to change order status' });
    }
}

const approveReturn = async (req, res) => {
    try {
        console.log("return order")
        const { productId, orderId, reason } = req.body;
        // const returnReason = req.session.reason;

        console.log(productId, orderId, reason);

        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: orderId, "items.product_id": productId },
            {
                $set: {
                    'items.$.return_approval': 2,
                    'items.$.status': "Returned",
                    'items.$.reason': reason
                }
            },
            { new: true }
        );

        console.log(updatedOrder);

        const returnedProduct = updatedOrder.items.find(item => item.product_id.toString() === productId);
        const returnedQuantity = parseInt(returnedProduct.quantity);

        await Product.findOneAndUpdate(
            { _id: productId },
            { $inc: { quantity: returnedQuantity } }
        );

        res.status(200).json({ message: 'Order returned successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const declineReturn = async (req, res) => {
    try {
        console.log("return order")
        const { productId, orderId } = req.body;

        console.log(productId, orderId);

        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: orderId, "items.product_id": productId },
            { $set: { 'items.$.return_approval': 3 } },
            { new: true }
        );

        console.log(updatedOrder);

        res.status(200).json({ message: 'Order returned successfully' });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}



export {
    laodOrders,
    loadOrderDetails,
    loadAdminOrders,
    loadAdminOrderDetails,
    changeOrderStatus,
    cancelOrder,
    returnOrder,
    approveReturn,
    declineReturn
}