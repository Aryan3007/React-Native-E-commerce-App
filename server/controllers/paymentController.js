import Order from "../models/Order.js";

// Mock payment handling
export const handlePayment = async (req, res) => {
    const { orderId, paymentStatus } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.paymentStatus === 'Paid') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        order.paymentStatus = paymentStatus || 'Paid';
        await order.save();

        res.status(200).json({ message: 'Payment processed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process payment', error });
    }
};
