const express = require("express");
const authController = require("../controllers/authController");
const clinicController = require("../controllers/clinicController");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router
  .route("/")
  .get(authController.restrictTo("admin"), clinicController.getAllClinics)
  .post(upload.single("coverImage"), clinicController.createClinic);

router.get("/approved-clinics", clinicController.getApprovedClinics);

router
  .route("/:id")
  .get(clinicController.getClinic)
  .patch(upload.single("coverImage"), clinicController.updateClinic)
  .delete(clinicController.deleteClinic);

module.exports = router;
