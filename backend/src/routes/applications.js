const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { applicationSchema } = require("../validators/applicationValidators");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (err) {
    logger.error({ err }, "Failed to fetch applications");
    next(err);
  }
});

router.post("/", validate(applicationSchema), async (req, res, next) => {
  try {
    const application = await prisma.application.create({
      data: { ...req.body, userId: req.userId },
    });
    res.status(201).json(application);
  } catch (err) {
    logger.error({ err }, "Failed to create application");
    next(err);
  }
});

router.put("/:id", validate(applicationSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updated = await prisma.application.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update application");
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }

    await prisma.application.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete application");
    next(err);
  }
});

module.exports = router;