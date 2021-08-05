const express = require("express");
const authController = require("../controllers/authController");
const clinicController = require("../controllers/clinicController");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    clinicController.getAllClinics
  )
  .post(upload.single("coverImage"), clinicController.createClinic);

router
  .route("/detail")
  .get(authController.protect, clinicController.getClinicByToken)
  .patch(
    authController.protect,
    authController.restrictTo("doctor"),
    upload.single("coverImage"),
    clinicController.updateInfoClinic
  );

router
  .route("/detail/schedule")
  .get(
    authController.protect,
    authController.restrictTo("doctor"),
    clinicController.getScheduleClinic
  )
  .patch(
    authController.protect,
    authController.restrictTo("doctor"),
    clinicController.updateScheduleClinic
  );

router.get("/approved-clinics", clinicController.getApprovedClinics);
router.get("/nearest-clinics", clinicController.getNearestClinics);
router.get("/symptom", clinicController.getClinicsBySymptoms);

router
  .route("/:id")
  .get(clinicController.getClinic)
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    clinicController.updateStatusClinic
  );

module.exports = router;
