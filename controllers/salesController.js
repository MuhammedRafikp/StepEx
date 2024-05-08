import Order from "../models/orderModel.js";


const loadSales = async (req, res) => {
    try {

        const { reportType, startDate, endDate } = req.query;
        console.log(req.query)

        let salesData;
        const reportTypes = ["All", "Today", "Last Week", "Last Month", "This Year", "Custom Date Range"];
        let currentType = reportType;

        if (!reportType) {

            salesData = await Order.find({});
            salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
            console.log(reportType, salesData)
            currentType = "All";

            // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
            res.render("sales", { sales: salesData, currentType, reportTypes });

        } else {

            if (reportType === 'Custom Date Range' && startDate && endDate) {

                salesData = await Order.find({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } });
                salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
                // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
                res.render("sales", { sales: salesData, currentType, reportTypes,startDate,endDate });

            } else{
            
            if (reportType === 'Today') {

                const today = new Date();
                const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                salesData = await Order.find({ date: { $gte: startOfToday, $lt: endOfToday } });

            } else if (reportType === 'Last Week') {

                const today = new Date();
                const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
                const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); 
                salesData = await Order.find({ date: { $gte: startOfWeek, $lt: endOfWeek } });


            } else if (reportType === 'Last Month') {

                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29); 
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                salesData = await Order.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });


            } else if (reportType === 'This Year') {

                const today = new Date();
                const startOfYear = new Date(today.getFullYear(), 0, 1); 
                const endOfYear = new Date(today.getFullYear() + 1, 0, 1); 
                salesData = await Order.find({ date: { $gte: startOfYear, $lte: endOfYear } });

            } else if (reportType === 'All') {

                salesData = await Order.find({});
            }


            salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
            // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
            res.render("sales", { sales: salesData, currentType, reportTypes });
        }
    }

    } catch (error) {

        console.error(error.message);
        res.status(500).send('Internal server error');
    }
}

import pdf from "html-pdf"
import Path from "path";




export {
    loadSales,
    
}



