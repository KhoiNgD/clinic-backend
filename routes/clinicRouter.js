const express = require("express");
const authController = require("../controllers/authController");
const clinicController = require("../controllers/clinicController");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(clinicController.getAllClinics)
  .post(upload.array("image"), clinicController.createClinic);

router
  .route("/:id")
  .get(clinicController.getClinic)
  .patch(upload.array("image"), clinicController.updateClinic)
  .delete(clinicController.deleteClinic);

module.exports = router;
