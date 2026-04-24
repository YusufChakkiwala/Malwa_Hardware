const express = require("express");
const router = express.Router();
const {
  getFAQs,
  createFAQ,
  deleteFAQ
} = require("../controllers/faqController");

router.get("/faqs", getFAQs);
router.post("/faqs", createFAQ);
router.delete("/faqs/:id", deleteFAQ);

module.exports = router;