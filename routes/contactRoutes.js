const express = require("express");
const router = express.Router();
const { getContacts, createContact, getContact, updateContact, deleteContact, getContactss, searchContact } = require("../controllers/contactController");
const validateToken = require("../middleware/validateTokenHandler");

router.route("/get").get(getContactss);
router.use(validateToken).route("/").get(getContacts).post(createContact);
router.use(validateToken).route("/:id").get(getContact).put(updateContact).delete(deleteContact);
router.use(validateToken).get("/search-contact/:key", validateToken, searchContact);

module.exports = router;