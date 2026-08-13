const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { applicationSchema, activityLogSchema } = require("../validators/applicationValidators");

const router = express.Router();

router.use(requireAuth);

// Helper: connect-or-create tags by name, scoped per user via applications
async function resolveTags(tagNames = []) {
  const tags = await Promise.all(
    tagNames.map(async (name) => {
      const existing = await prisma.tag.findFirst({ where: { name } });
      if (existing) return { id: existing.id };
      const created = await prisma.tag.create({ data: { name } });
      return { id: created.id };
    })
  );
  return tags;
}

router.get("/", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      include: { tags: true, activityLogs: { orderBy: { createdAt: "desc" } } },
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
    const { tagNames, ...data } = req.body;
    const tagConnections = await resolveTags(tagNames);

    const application = await prisma.application.create({
      data: {
        ...data,
        userId: req.userId,
        tags: { connect: tagConnections },
      },
      include: { tags: true, activityLogs: true },
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
    const { tagNames, ...data } = req.body;

    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }

    const tagConnections = tagNames ? await resolveTags(tagNames) : undefined;

    const updated = await prisma.application.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(tagConnections && { tags: { set: tagConnections } }),
      },
      include: { tags: true, activityLogs: { orderBy: { createdAt: "desc" } } },
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

// Activity log (notes timeline) endpoints
router.post("/:id/notes", validate(activityLogSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }

    const note = await prisma.activityLog.create({
      data: { content: req.body.content, applicationId: Number(id) },
    });
    res.status(201).json(note);
  } catch (err) {
    logger.error({ err }, "Failed to add note");
    next(err);
  }
});

module.exports = router;