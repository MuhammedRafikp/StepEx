import User from "../models/userModel.js";
import Products from "../models/productsModel.js";
import Cart from "../models/cartModel.js";
import CategoryOffer from "../models/categoryOfferModel.js";
import ProductOffer from "../models/productOfferModel.js";

const loadShop = async (req, res) => {
    try {

        const userId = req.session._id;
        const userData = await User.findOne({ _id: userId });

        const page = req.query.page || 1;
        const limit = 6;
        const skip = (page - 1) * limit;
        const productsData = await Products.find({ is_delete: 0 }).populate("category").skip(skip).limit(limit);
        const totalProducts = await Products.countDocuments({});
        const totalPages = Math.ceil(totalProducts / limit);

        for (let product of productsData) {
            const productId = product._id;
            let bestOfferPrice = product.price; // Initialize with the original price

            // Check if product offer exists
            const productOffer = await ProductOffer.findOne({ product: productId });
            if (productOffer) {
                const offerPrice = product.price - productOffer.offer_price;
                bestOfferPrice = Math.min(bestOfferPrice, offerPrice); // Choose the lowest price
            }

            // Check if category offer exists
            const categoryId = product.category._id;
            const categoryOffer = await CategoryOffer.findOne({ category: categoryId });
            if (categoryOffer) {
                const offerPrice = product.price - (product.price * categoryOffer.offer / 100);
                bestOfferPrice = Math.min(bestOfferPrice, offerPrice); // Choose the lowest price
            }
            await Products.findByIdAndUpdate(productId, { offer_price: bestOfferPrice });


            // product.offer_price = bestOfferPrice; 
            // console.log(product.offer_price)
        }

        const cartData = await Cart.findOne({ user_id: userId })
        const cartItemCount = cartData ? cartData.items.length : 0;

        res.render("shop", { user: userData, products: productsData, cartCount: cartItemCount, totalPages, currentPage: page });

    } catch (error) {
        console.error(error.message);
    }
}


const loadSingleProduct = async (req, res) => {
    try {
        const userId = req.session._id;
        const user = await User.findOne({ _id: userId });
        const productId = req.query.id;
        const productData = await Products.findOne({ _id: productId }).populate("category");


        let bestOfferPrice = productData.price; // Initialize with the original price
        // Check if product offer exists
        const productOffer = await ProductOffer.findOne({ product: productId });
        if (productOffer) {
            const offerPrice = productData.price - productOffer.offer_price;
            bestOfferPrice = Math.min(bestOfferPrice, offerPrice); // Choose the lowest price
        }

        // Check if category offer exists
        const categoryId = productData.category._id;
        const categoryOffer = await CategoryOffer.findOne({ category: categoryId });
        if (categoryOffer) {
            const offerPrice = productData.price - (productData.price * categoryOffer.offer / 100);
            bestOfferPrice = Math.min(bestOfferPrice, offerPrice); // Choose the lowest price
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