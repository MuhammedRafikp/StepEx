import User from "../models/userModel.js";
import Products from "../models/productsModel.js";
import Category from "../models/categoryModel.js";
import Cart from "../models/cartModel.js";
import CategoryOffer from "../models/categoryOfferModel.js";
import ProductOffer from "../models/productOfferModel.js";

// const loadShop = async (req, res) => {
//     try {
//         console.log("shop");
//         console.log(req.query)
//         const userId = req.session._id;
//         const userData = await User.findOne({ _id: userId });

//         // Pagination parameters
//         const page = req.query.page || 1;
//         const limit = 6;
//         const skip = (page - 1) * limit;

//         // Query parameters
//         const searchQuery = req.query.search || '';
//         const categoryFilter = req.query.category ? req.query.category.split(',') : [];
//         const genderFilter = req.query.gender || '';
//         const minPrice = parseInt(req.query.minPrice) || 0;
//         const maxPrice = parseInt(req.query.maxPrice) || Infinity;
//         const sortBy = req.query.sortBy || 'new-to-old';

//         // Constructing the filter object
//         const filter = {
//             is_delete: 0,
//             name: { $regex: new RegExp(searchQuery, 'i') },
//             price: { $gte: minPrice, $lte: maxPrice }
//         };
//         if (categoryFilter.length > 0) {
//             filter.category = { $in: categoryFilter };
//         }
//         if (genderFilter !== '') {
//             filter.gender = genderFilter;
//         }
// console.log(filter,"filter")
//         // Sorting options
//         let sortOption = {};
//         if (sortBy === 'old-to-new') {
//             sortOption = { createdAt: 1 };
//         } else if (sortBy === 'high-to-low') {
//             sortOption = { offer_price: -1 };
//         } else if (sortBy === 'low-to-high') {
//             sortOption = { offer_price: 1 };
//         } else {
//             sortOption = { createdAt: -1 }; // Default: new-to-old
//         }

//         // Fetching products based on the filter, sort, and pagination
//         const productsData = await Products.find(filter).populate('category').sort(sortOption).skip(skip).limit(limit);

//         const totalProducts = await Products.countDocuments({});
//         const totalPages = Math.ceil(totalProducts / limit);

//         for (let product of productsData) {

//             const productId = product._id;
//             let bestOfferPrice = product.price;

//             const productOffer = await ProductOffer.findOne({ product: productId });
//             if (productOffer) {
//                 const offerPrice = product.price - productOffer.offer_price;
//                 bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
//             }

//             const categoryId = product.category._id;
//             const categoryOffer = await CategoryOffer.findOne({ category: categoryId });
//             if (categoryOffer) {
//                 const offerPrice = product.price - (product.price * categoryOffer.offer / 100);
//                 bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
//             }

//             await Products.findByIdAndUpdate(productId, { offer_price: bestOfferPrice });
//             // product.offer_price = bestOfferPrice; 
//             // console.log(product.offer_price)
//         }

//         const cartData = await Cart.findOne({ user_id: userId })
//         const cartItemCount = cartData ? cartData.items.length : 0;
//         const categoryData = await Category.find({ is_delete: 0 });
//         const genders = ["Men", "Women", "Boys", "Girls"];

//         // console.log(productsData,"productsData")
//         res.render("shop", { user: userData, products: productsData, categories: categoryData, genders, cartCount: cartItemCount, totalPages, currentPage: page });

//     } catch (error) {
//         console.error(error.message);
//     }
// }


const loadShop = async (req, res) => {
    try {
        console.log("shop");
        console.log(req.query);
        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });

        // Pagination parameters
        const page = req.query.page || 1;
        const limit = 6;
        const skip = (page - 1) * limit;


        // Query parameters
        const searchQuery = req.query.search || '';
        const categoryFilter = req.query.category ? req.query.category.split(',') : [];
        const genderFilter = req.query.gender ? req.query.gender.split(',') : [];
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || Infinity;
        const sortBy = req.query.sortBy || 'new-to-old';

        // Constructing the filter object
        const filter = {
            is_delete: 0,
            name: { $regex: new RegExp(searchQuery, 'i') },
            offer_price: { $gte: minPrice, $lte: maxPrice }
        };
        if (categoryFilter.length > 0) {
            filter.category = { $in: categoryFilter };
        }
        if (genderFilter.length > 0) {
            filter.gender = { $in: genderFilter };
        }
        console.log(filter, "filter");

        // Sorting options
        let sortOption = {};
        if (sortBy === 'old-to-new') {
            sortOption = { createdAt: 1 };
        } else if (sortBy === 'high-to-low') {
            sortOption = { offer_price: -1 };
        } else if (sortBy === 'low-to-high') {
            sortOption = { offer_price: 1 };
        } else {
            sortOption = { createdAt: -1 }; // Default: new-to-old
        }
        console.log(sortOption, "sortOption");
        // Fetching products based on the filter, sort, and pagination
        let productsData = await Products.find(filter).populate('category').sort(sortOption).skip(skip).limit(limit);
        // console.log(productsData, "productsData");
        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Otherwise, render the shop page with the filtered products
        const cartData = await Cart.findOne({ user_id: userId });
        const cartItemCount = cartData ? cartData.items.length : 0;
        const categoryData = await Category.find({ is_delete: 0 });
        const genders = ["Men", "Women", "Boys", "Girls"];



        res.render("shop", {
            user: userData, products: productsData, categories: categoryData, genders, cartCount: cartItemCount, totalPages, currentPage: page, selectedCategories: categoryFilter, selectedGenders: genderFilter,
            minPrice,maxPrice,sortBy
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const loadSingleProduct = async (req, res) => {
    try {
        const userId = req.session._id;
        const user = await User.findOne({ _id: userId });
        const productId = req.query.id;
        const productData = await Products.findOne({ _id: productId }).populate("category");

        let bestOfferPrice = productData.price;

        const productOffer = await ProductOffer.findOne({ product: productId });
        if (productOffer) {
            const offerPrice = productData.price - productOffer.offer_price;
            bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
        }

        const categoryId = productData.category._id;
        const categoryOffer = await CategoryOffer.findOne({ category: categoryId });
        if (categoryOffer) {
            const offerPrice = productData.price - (productData.price * categoryOffer.offer / 100);
            bestOfferPrice = Math.min(bestOfferPrice, offerPrice);
        }

        await Products.findByIdAndUpdate(productId, { offer_price: bestOfferPrice });

        const cartData = await Cart.findOne({ user_id: userId }).populate('items.products');
        const cartItemCount = cartData ? cartData.items.length : 0;

        res.render("single-product", { user: user, product: productData, cartCount: cartItemCount });

    } catch (error) {
        console.error(error.message);
    }
}


export {
    loadSingleProduct,
    loadShop
}