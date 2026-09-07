const express = require("express");
const prisma = require("../prisma");
const logger = require("../logger");
const requireAuth = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// Fetch user notifications + unread count
router.get("/", async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    logger.error({ err }, "Failed to fetch notifications");
    next(err);
  }
});

// Mark single notification as read
router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(id) },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to mark notification as read");
    next(err);
  }
});

// Mark all notifications as read
router.patch("/read-all", async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    logger.error({ err }, "Failed to mark all notifications as read");
    next(err);
  }
});

// Delete a notification
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await prisma.notification.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete notification");
    next(err);
  }
});

module.exports = router;
