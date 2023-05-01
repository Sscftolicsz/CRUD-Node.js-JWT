const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");

// ambil seluruh contact yang ada pada database tanpa authentication
const getContactss = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalResults = await Contact.find().countDocuments();

        const contacts = await Contact.find().skip(startIndex).limit(limit);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit),
            totalResults: totalResults,
            results: contacts
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const getContacts = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const totalResults = await Contact.find({ user_id: req.user.id }).countDocuments();

        const contacts = await Contact.find({ user_id: req.user.id }).skip(startIndex).limit(limit);

        res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit),
            totalResults: totalResults,
            results: contacts
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const createContact = asyncHandler(async (req, res) => {
    console.log("The request body is :", req.body);
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        res.status(400);
        throw new Error("All fields are mandatory !")
    }
    const contact = await Contact.create({
        name,
        email,
        phone,
        user_id: req.user.id
    });
    res.status(201).json({ message: "Contact registered successfully !" });
});

const getContact = asyncHandler(async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            throw new Error("Contact not found");
        }
        res.status(200).json(contact);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const updateContact = asyncHandler(async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            throw new Error("Contact not found");
        }

        if (contact.user_id.toString() != req.user.id) {
            res.status(403);
            throw new Error("User dont have permission to update other user contacts");
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json({ message: "Updated Contact successfully !" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const deleteContact = asyncHandler(async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            throw new Error("Contact not found");
        }
        if (contact.user_id.toString() != req.user.id) {
            res.status(403);
            throw new Error("User dont have permission to update other user contacts");
        }
        res.status(200).json({ message: "Deleted Contact successfully !" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const searchContact = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const result = await Contact.find({
            "$or": [
                {
                    name: { $regex: req.params.key }
                }
            ]
        }).skip(startIndex).limit(limit);

        if (result.length === 0) {
            throw new Error("Contact not found");
        }

        const totalResults = await Contact.find({
            "$or": [
                {
                    name: { $regex: req.params.key }
                }
            ]
        }).countDocuments();

        const totalPages = Math.ceil(totalResults / limit);

        res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalResults: totalResults,
            results: result
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});
module.exports = { getContacts, createContact, getContact, updateContact, deleteContact, getContactss, searchContact };