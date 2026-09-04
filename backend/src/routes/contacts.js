const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { contactSchema } = require("../validators/contactValidators");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    // Attach a lightweight application summary for any linked contacts
    const appIds = contacts.filter((c) => c.applicationId).map((c) => c.applicationId);
    const apps = appIds.length
      ? await prisma.application.findMany({
        where: { id: { in: appIds }, userId: req.userId },
        select: { id: true, company: true, role: true },
      })
      : [];
    const appMap = Object.fromEntries(apps.map((a) => [a.id, a]));

    const enriched = contacts.map((c) => ({
      ...c,
      application: c.applicationId ? appMap[c.applicationId] || null : null,
    }));

    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Failed to fetch contacts");
    next(err);
  }
});

router.post("/", validate(contactSchema), async (req, res, next) => {
  try {
    if (req.body.applicationId) {
      const app = await prisma.application.findUnique({ where: { id: req.body.applicationId } });
      if (!app || app.userId !== req.userId) {
        return res.status(400).json({ error: "Invalid application" });
      }
    }
    const contact = await prisma.contact.create({
      data: { ...req.body, userId: req.userId },
    });
    res.status(201).json(contact);
  } catch (err) {
    logger.error({ err }, "Failed to create contact");
    next(err);
  }
});

router.put("/:id", validate(contactSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contact.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Contact not found" });
    }
    if (req.body.applicationId) {
      const app = await prisma.application.findUnique({ where: { id: req.body.applicationId } });
      if (!app || app.userId !== req.userId) {
        return res.status(400).json({ error: "Invalid application" });
      }
    }
    const updated = await prisma.contact.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update contact");
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.contact.findUnique({ where: { id: Number(id) } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Contact not found" });
    }
    await prisma.contact.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete contact");
    next(err);
  }
});

module.exports = router;