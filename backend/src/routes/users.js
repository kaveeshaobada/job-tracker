const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { updateProfileSchema } = require("../validators/userValidators");

const router = express.Router();
router.use(requireAuth);

router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, targetRole: true, weeklyGoal: true },
    });
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Failed to fetch profile");
    next(err);
  }
});

router.put("/me", validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: req.body,
      select: { id: true, email: true, name: true, targetRole: true, weeklyGoal: true },
    });
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Failed to update profile");
    next(err);
  }
});

module.exports = router;