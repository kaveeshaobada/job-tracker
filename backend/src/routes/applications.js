const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { applicationSchema, activityLogSchema } = require("../validators/applicationValidators");
const upload = require("../middleware/upload");
const cloudinary = require("../cloudinary");

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

router.get("/export", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Company", "Role", "Status", "Date Applied", "Follow-up Date", "Link", "Tags"];
    const escapeCsv = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const rows = applications.map((a) =>
      [
        a.company,
        a.role,
        a.status,
        new Date(a.dateApplied).toLocaleDateString(),
        a.followUpDate ? new Date(a.followUpDate).toLocaleDateString() : "",
        a.link || "",
        a.tags.map((t) => t.name).join("; "),
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
    res.send(csv);
  } catch (err) {
    logger.error({ err }, "Failed to export CSV");
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      select: { status: true, createdAt: true },
    });

    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    // Applications per week, last 8 weeks
    const now = new Date();
    const weeklyBuckets = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (7 - i) * 7);
      return { week: `Wk ${i + 1}`, count: 0, weekStart };
    });

    applications.forEach((app) => {
      const created = new Date(app.createdAt);
      for (let i = weeklyBuckets.length - 1; i >= 0; i--) {
        if (created >= weeklyBuckets[i].weekStart) {
          weeklyBuckets[i].count++;
          break;
        }
      }
    });

    const total = applications.length;
    const responded = applications.filter((a) => a.status !== "Applied").length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
    const offers = statusCounts["Offer"] || 0;
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

    res.json({
      total,
      statusCounts,
      weeklyTrend: weeklyBuckets.map(({ week, count }) => ({ week, count })),
      responseRate,
      offerRate,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch stats");
    next(err);
  }
});

router.get("/upcoming", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        userId: req.userId,
        followUpDate: { not: null },
      },
      select: {
        id: true,
        company: true,
        role: true,
        status: true,
        followUpDate: true,
      },
      orderBy: { followUpDate: "asc" },
    });
    res.json(applications);
  } catch (err) {
    logger.error({ err }, "Failed to fetch upcoming events");
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.userId },
      include: { tags: true, activityLogs: { orderBy: { createdAt: "desc" } }, attachments: true },
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
      include: { tags: true, activityLogs: { orderBy: { createdAt: "desc" } }, attachments: true },
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
      include: { tags: true, activityLogs: { orderBy: { createdAt: "desc" } }, attachments: true },
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

router.post("/:id/attachments", upload.single("file"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        url: req.file.path, // Cloudinary URL
        applicationId: Number(id),
      },
    });
    res.status(201).json(attachment);
  } catch (err) {
    logger.error({ err }, "Failed to upload attachment");
    next(err);
  }
});

router.delete("/:id/attachments/:attachmentId", async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;
    const existing = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Application not found" });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: Number(attachmentId) },
    });
    if (attachment) {
      // Extract public_id from Cloudinary URL to delete the actual file too
      const publicId = attachment.url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" }).catch(() => {});
    }

    await prisma.attachment.delete({ where: { id: Number(attachmentId) } });
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete attachment");
    next(err);
  }
});

module.exports = router;