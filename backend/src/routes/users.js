const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { updateProfileSchema } = require("../validators/userValidators");
const uploadAvatar = require("../middleware/uploadAvatar");

const router = express.Router();
router.use(requireAuth);

router.get("/me", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, targetRole: true, weeklyGoal: true, avatarUrl: true },
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
      select: { id: true, email: true, name: true, targetRole: true, weeklyGoal: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Failed to update profile");
    next(err);
  }
});

router.post("/me/avatar", uploadAvatar.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: req.file.path },
      select: { id: true, email: true, name: true, targetRole: true, weeklyGoal: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    logger.error({ err }, "Failed to upload avatar");
    next(err);
  }
});


module.exports = router;