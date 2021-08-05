const express = require("express");
const specialistController = require("../controllers/specialistController");

const router = express.Router();

router.get("/", specialistController.getAllSpecialists);
router.get("/symptoms", specialistController.getAllSymptoms);
router.get("/symptoms/diagnosis", specialistController.getSymptomsByDiagnosis);
router.get("/symptom", specialistController.getBySymptoms);
router.post("/", specialistController.createSpecialist);
router.patch("/:id/symptom", specialistController.updateSymptoms);

module.exports = router;
