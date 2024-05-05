import Order from "../models/orderModel.js";


const loadSales = async (req, res) => {
    try {

        const { reportType, startDate, endDate } = req.query;

        let salesData;

        if (reportType === 'Custom' && startDate && endDate) {

            salesData = await Order.find({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } });

        } else if (reportType === 'Today') {

            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            salesData = await Order.find({ date: { $gte: new Date(startOfToday), $lt: new Date(endOfToday) } });

        } else if (reportType === 'Weekly') {

            const today = new Date();
            const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
            const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()) + 1);
            salesData = await Order.find({ date: { $gte: startOfWeek, $lt: endOfWeek } });

        } else if (reportType === 'Monthly') {

            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            salesData = await Order.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });

        } else if (reportType === 'Yearly') {

            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
            salesData = await Order.find({ date: { $gte: startOfYear, $lte: endOfYear } });
        }

        if (!salesData) {
            salesData = await Order.find({}); // default to all sales data if no report type is selected
        }

        salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));

        console.log(reportType, salesData)

        res.render("sales", { sales: salesData });

    } catch (error) {

        console.error(error.message);
        res.status(500).send('Internal server error');
    }
}



export {
    loadSales
}



