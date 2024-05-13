import Order from "../models/orderModel.js";


// const loadSales = async (req, res) => {
//     try {

//         const { reportType, startDate, endDate } = req.query;
//         console.log(req.query)

//         let salesData;
//         const reportTypes = ["All", "Today", "Last Week", "Last Month", "This Year", "Custom Date Range"];
//         let currentType = reportType;

//         if (!reportType) {

//             salesData = await Order.find({});
//             salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
//             console.log(reportType, salesData)
//             currentType = "All";

//             // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
//             res.render("sales", { sales: salesData, currentType, reportTypes });

//         } else {

//             if (reportType === 'Custom Date Range' && startDate && endDate) {

//                 salesData = await Order.find({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } });
//                 salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
//                 // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
//                 res.render("sales", { sales: salesData, currentType, reportTypes,startDate,endDate });

//             } else{

//             if (reportType === 'Today') {

//                 const today = new Date();
//                 const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
//                 const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
//                 salesData = await Order.find({ date: { $gte: startOfToday, $lt: endOfToday } });

//             } else if (reportType === 'Last Week') {

//                 const today = new Date();
//                 const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
//                 const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); 
//                 salesData = await Order.find({ date: { $gte: startOfWeek, $lt: endOfWeek } });


//             } else if (reportType === 'Last Month') {

//                 const today = new Date();
//                 const startOfMonth = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29); 
//                 const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//                 salesData = await Order.find({ date: { $gte: startOfMonth, $lte: endOfMonth } });


//             } else if (reportType === 'This Year') {

//                 const today = new Date();
//                 const startOfYear = new Date(today.getFullYear(), 0, 1); 
//                 const endOfYear = new Date(today.getFullYear() + 1, 0, 1); 
//                 salesData = await Order.find({ date: { $gte: startOfYear, $lte: endOfYear } });

//             } else if (reportType === 'All') {

//                 salesData = await Order.find({});
//             }

//             salesData = salesData.filter(order => order.items.some(item => item.status === 'Delivered'));
//             // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
//             res.render("sales", { sales: salesData, currentType, reportTypes });
//         }
//     }

//     } catch (error) {

//         console.error(error.message);
//         res.status(500).send('Internal server error');
//     }
// }


const loadSales = async (req, res) => {
    try {

        let { reportType, startDate, endDate } = req.query;
        console.log(req.query)

        const reportTypes = ["All", "Today", "Last Week", "Last Month", "This Year", "Custom Date Range"];
        let currentType = reportType;

        if (!reportType || reportType === 'Today') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            currentType = "Today";

        } else if (reportType === 'Last Week') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
            endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        } else if (reportType === 'Last Month') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        } else if (reportType === 'This Year') {
            const today = new Date();
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear() + 1, 0, 1);

        } else if (reportType === 'Custom Date Range') {
            // Parse start date and end date from request query
            startDate = new Date(startDate);
            endDate = new Date(endDate);
        
            // Adjust start date to include the entire selected day
            startDate.setHours(0, 0, 0, 0);
        
            // Adjust end date to include the entire selected day
            endDate.setHours(23, 59, 59, 999);
        }
        

        let salesData;

        if (reportType === 'All') {

            salesData = await Order.aggregate([
                { $unwind: "$items" },
                { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.product_id",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                { $sort: { date: -1 } }
            ]);

        } else {

            salesData = await Order.aggregate([
                {
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                { $unwind: "$items" },
                { $match: { "items.status": { $nin: ["Cancelled", "Returned"] } } },
                {
                    $lookup: {
                        from: "products",
                        localField: "items.product_id",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                { $unwind: "$productDetails" },
                { $sort: { date: -1 } }
            ]);
        }

        console.log(reportType, typeof (salesData));
        // res.render("downloadSalesReport", { sales: salesData, currentType, reportTypes });
        res.render("sales", { sales: salesData, currentType, reportTypes });

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



