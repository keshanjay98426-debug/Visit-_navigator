const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Category = require('../models/Category');

// @route   GET api/categories
// @desc    Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/categories
// @desc    Create a category (Admin only)
router.post('/', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        const { name, description, icon } = req.body;
        
        let category = await Category.findOne({ name });
        if (category) {
            return res.status(400).json({ msg: 'Category already exists' });
        }

        category = new Category({ name, description, icon });
        await category.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/categories/:id
// @desc    Update a category (Admin only)
router.put('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedCategory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/categories/:id
// @desc    Delete a category (Admin only)
router.delete('/:id', [auth, roleAuth(['admin'])], async (req, res) => {
    try {

        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
