import Category from "../models/categoryModel.js";

const loadCategory = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_delete: 0 });

        res.render("category", { categories: categoryData });
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddCategory = async (req, res) => {
    try {
        res.render("add-Category")
    } catch (error) {
        console.log(error.message);
    }
}


const addCategory = async (req, res) => {
    try {

        const name = req.body.name;
        const existingCategoryWithName = await Category.findOne({ name: name });

        if (existingCategoryWithName) {

            res.render("add-category", { name: req.body.name, message: "Category with the same name already exists" });
        } else {

            const category = new Category({
                name: req.body.name,
                image: req.file.filename,
                is_delete: 0
            })
            const categoryData = await category.save();

            if (categoryData) {
                res.redirect("/admin/category");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadUnlistedCategories = async (req, res) => {
    try {
        const categoryData = await Category.find({ is_delete: 1 });
        res.render("unlisted-categories", { categories: categoryData });
    } catch (error) {
        console.log(error.message);
    }
}


const unlistCategory = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id, "hi")
        await Category.updateOne(
            { _id: id },
            { $set: { is_delete: 1 } }
        );

        res.redirect("/admin/category");

    } catch (error) {
        console.log(error.message);
    }
}


const retrieveCategory = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(id, "hi")
        await Category.updateOne(
            { _id: id },
            { $set: { is_delete: 0 } }
        );
        res.redirect("/admin/category/unlisted-category");

    } catch (error) {
        console.log(error.message);
    }
}


const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findOne({ _id: id });
        res.render("edit-Category", { category: categoryData })
    } catch (error) {
        console.log(error.message);
    }
}


const editCategory = async (req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        let image = req.file ? req.file.filename : null;
        const existingCategory = await Category.findById(id);

        if (!image) {
            image = existingCategory.image;
        }

        const existingCategoryWithName = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });

        if (existingCategoryWithName && existingCategoryWithName._id.toString() !== id) {
            const categoryData = await Category.findOne({ _id: id });
            res.render("edit-category", { category: categoryData, message: `'${name}' already exists!` });
        } else {
            await Category.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, image: image } });
            res.redirect("/admin/category");
        }

    } catch (error) {
        console.error(error.message);
    }
}


export {
    loadCategory,
    loadAddCategory,
    addCategory,
    loadUnlistedCategories,
    unlistCategory,
    retrieveCategory,
    loadEditCategory,
    editCategory
}



