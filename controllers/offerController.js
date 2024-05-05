import Category from "../models/categoryModel.js";
import Products from "../models/productsModel.js";
import CategoryOffer from "../models/categoryOfferModel.js";
import ProductOffer from "../models/productOfferModel.js";

const loadCategoryOffers = async (req, res) => {
    try {
        const categoryOffersData = await CategoryOffer.find({}).populate("category");
        res.render("offers-category", { categoryOffer: categoryOffersData });
    } catch (error) {
        console.error(error);
    }
}


const loadAddCategoryOffer = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render("add-offer-category", { category: categoryData });
    } catch (error) {
        console.error(error);
    }
}


const addCategoryOffer = async (req, res) => {
    try {
        console.log(req.body);
        const { categoryId, offer, validity } = req.body;

        const existingCategoryOffer = await CategoryOffer.findOne({ category: categoryId });

        console.log(existingCategoryOffer);

        if (existingCategoryOffer) {
            // console.log('Category offer already exists' )
            return res.status(409).json({ success: false, message: 'Offer with this category already exists' });

        } else {
            const categoryOffer = new CategoryOffer({
                category: categoryId,
                offer: offer,
                validity: validity
            })
            await categoryOffer.save();
            console.log('Offer added successfully');
            return res.status(201).json({ success: true, message: 'Offer added successfully' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const loadEditCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log(categoryId);
        const categoryData = await Category.find({ is_delete: 0 });
        const categoryOfferData = await CategoryOffer.findOne({ category: categoryId }).populate("category");
        console.log(categoryOfferData);
        res.render("edit-offer-category", { category: categoryData, categoryOffer: categoryOfferData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const editCategoryOffer = async (req, res) => {
    try {
        console.log("hello");
        const { id, category, offer, validity } = req.body;

        const categoryId = await Category.findOne({ name: category }, { _id: 1 });
        console.log("id:", categoryId);
        const existingCategoryOffer = await CategoryOffer.findOne({ category: categoryId, _id: { $ne: id } });

        // console.log(existingCategoryOffer);

        if (existingCategoryOffer) {

            return res.status(409).json({ success: false, message: 'Offer with this category already exists' });

        } else {

            await CategoryOffer.findOneAndUpdate(
                { _id: id },
                { $set: { category: categoryId, offer: offer, validity: validity } },
                { new: true }
            );
            return res.status(200).json({ success: true, message: 'Offer updated successfully' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const deleteCategoryOffer = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id);
        console.log("hellooo");
        const offer = await CategoryOffer.findOne({_id:id}); 
        console.log("hellooo");
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const loadProductOffers = async (req, res) => {
    try {
        const productOffersdata = await ProductOffer.find({}).populate("product");
        res.render("offers-product", { productOffer: productOffersdata });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });

    }
}


const loadAddProductOffer = async (req, res) => {
    try {
        const productData = await Products.find({ is_delete: 0 });
        res.render("add-offer-product", { products: productData });
        // console.log(productData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const addProductOffer = async (req, res) => {
    try {
        console.log(req.body);
        const { productId, offer, offerPrice, validity } = req.body;
        const existingProductOffer = await ProductOffer.findOne({ product: productId });
        if (existingProductOffer) {
            console.log("yes");
            return res.status(409).json({ success: false, message: 'Offer with this product already exists' });
        } else {
            console.log("no");
            const productOffer = new ProductOffer({
                product: productId,
                offer: offer,
                offer_price: offerPrice,
                validity: validity
            });
            await productOffer.save();
            return res.status(201).json({ success: true, message: 'Offer added successfully' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const loadEditProductOffer = async (req, res) => {
    try {
        const productId = req.query.id;
        console.log(productId);
        const productData = await Products.find({ is_delete: 0 });
        const productOfferData = await ProductOffer.findOne({ product: productId }).populate('product');
        console.log("productOfferData:", productOfferData)
        res.render("edit-offer-product", { products: productData, productOffer: productOfferData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const editProductOffer = async (req, res) => {
    try {
        console.log(req.body);
        const { id, product, offer, offerPrice, validity } = req.body;
        const productId = await Products.findOne({ name: product }, { _id: 1 });
        // console.log("productId:", productId)
        console.log(typeof (id))
        const existingProductOffer = await ProductOffer.findOne({ product: productId, _id: { $ne: id } });

        if (existingProductOffer) {
            // console.log("yes")
            return res.status(409).json({ success: false, message: 'Offer with this product already exists' });
        } else {
            // console.log("no")
            await ProductOffer.findOneAndUpdate(
                { _id: id },
                { $set: { product: productId, offer: offer, offer_price: offerPrice, validity } },
                { new: true }
            );
            return res.status(200).json({ success: true, message: 'Offer updated successfully' });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


const deleteProductOffer = async (req, res) => {
    try {
        const id = req.query.id; // Retrieve ID from the request query
        console.log("id",id);
        await ProductOffer.deleteOne({_id:id}); // Pass the ID string directly
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}



export {
    loadCategoryOffers,
    loadAddCategoryOffer,
    addCategoryOffer,
    loadEditCategoryOffer,
    editCategoryOffer,
    deleteCategoryOffer,
    loadProductOffers,
    loadAddProductOffer,
    addProductOffer,
    loadEditProductOffer,
    editProductOffer,
    deleteProductOffer
}