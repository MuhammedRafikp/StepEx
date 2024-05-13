import Products from "../models/productsModel.js";
import Category from "../models/categoryModel.js";
import sharp from "sharp";


const loadProducts = async (req, res) => {

    try {
        const page = req.query.page || 1;
        const limit = 5;
        const skip = (page - 1) * limit;
        const productsData = await Products.find({ is_delete: 0 }).populate("category").skip(skip).limit(limit);
        // console.log(productsData);
        const totalProducts = await Products.countDocuments({});
        const totalPages = Math.ceil(totalProducts / limit);

        res.render("products", { products: productsData, totalPages, currentPage: page });
        // console.log(productsData)
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddProduct = async (req, res) => {

    try {
        const categories = await Category.find({ is_delete: 0 });
        const genders = ["Men", "Women", "Boys", "Girls"];
        res.render("add-product", { categories: categories, genders: genders });
        console.log("loadAddProduct")

    } catch (error) {

        console.log(error.message);
    }
}


const addProduct = async (req, res) => {
    try {

        const { name, price, category, gender, brand, quantity, description } = req.body;

        const existingProductWithName = await Products.findOne({ name: name });

        if (existingProductWithName) {
            console.log("same name");
            return res.status(400).json({ success: false, message: "Product with the same name already exists." });
        } else {
            console.log("different name");
            const categoryId = await Category.findOne({ name: category }, { _id: 1 });

            let croppedImages = [];

            for (let i = 0; i < req.files.length; i++) {

                const croppedBuffer = await sharp(req.files[i].path)
                    .resize({ width: 500, height: 500, fit: sharp.fit.cover })
                    .toBuffer();

                const filename = `cropped_${req.files[i].originalname}`;
                croppedImages.push(filename);

                await sharp(croppedBuffer).toFile(`public/uploads/productImages/${filename}`);
            }

            const newProduct = new Products({
                name: name,
                price: price,
                category: categoryId,
                gender: gender,
                brand: brand,
                quantity: quantity,
                description: description,
                images: croppedImages
            });
            await newProduct.save();
            res.status(200).json({ success: true });
        }

    } catch (error) {
        console.error(error.message);

        res.status(500).json({ success: false, error: error.message });
    }
};


const loadUnlsitedProducts = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const productData = await Products.find({ is_delete: 1 }).populate("category").skip(skip).limit(limit);
        const totalProducts = await Products.countDocuments({});
        const totalPages = Math.ceil(totalProducts / limit);
        res.render("unlisted-products", { products: productData, totalPages, currentPage: page })
    } catch (error) {
        console.error(error.message);
    }
}


const unlistProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("unlist");
        await Products.updateOne(
            { _id: id },
            { $set: { is_delete: 1 } }
        );

        res.redirect("/admin/products");

    } catch (error) {
        console.error(error.message);
    }
}


const retrieveProduct = async (req, res) => {
    try {
        const id = req.query.id;
        console.log("unlist");
        await Products.updateOne(
            { _id: id },
            { $set: { is_delete: 0 } }
        );

        res.redirect("/admin/products/unlisted-products");

    } catch (error) {
        console.error(error.message);
    }
}


const loadEditProduct = async (req, res) => {
    try {
        const productId = req.query.id;
        const productData = await Products.findOne({ _id: productId }).populate("category");
        const categories = await Category.find({});
        const genders = ["Men", "Women", "Boy", "Girl"];
        res.render("edit-product", { product: productData, categories: categories, genders: genders });
    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {
    try {

        const { id, name, price, category, gender, brand, quantity, description, deletedImages } = req.body;

        const existingProductWithName = await Products.findOne({ name: name, _id: { $ne: id } });
        if (existingProductWithName) {

            return res.status(400).json({ success: false, message: "A product with the same name already exists." });

        } else {

            const categoryId = await Category.findOne({ name: category }, { _id: 1 });
            
            const updatedProduct = await Products.findByIdAndUpdate(
                { _id: id },
                { $set: { name: name, price: price, category: categoryId, gender: gender, brand: brand, quantity: quantity, description: description } },
                { new: true }
            );

            const imageToDelete = JSON.parse(deletedImages);
            console.log(typeof (imageToDelete))
            //    console.log(imageToDelete)
            imageToDelete.forEach(async imageName => {
                const index = updatedProduct.images.indexOf(imageName);
                if (index !== -1) {
                    updatedProduct.images.splice(index, 1);
                }
            });

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {

                    const croppedBuffer = await sharp(req.files[i].path)
                        .resize({ width: 500, height: 500, fit: sharp.fit.cover })
                        .toBuffer();
                    const filename = `cropped_${req.files[i].originalname}`;
                    updatedProduct.images.push(filename);
                    await sharp(croppedBuffer).toFile(`public/uploads/productImages/${filename}`);
                }
            }

            await updatedProduct.save();
            res.status(200).json({ success: true, message: 'Product updated successfully' });
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.log("hello")
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export {
    loadProducts,
    loadAddProduct,
    addProduct,
    loadUnlsitedProducts,
    unlistProduct,
    retrieveProduct,
    loadEditProduct,
    editProduct,
}