const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");
const {
  checkApplicationReminders,
  handleApplicationDateChange,
} = require("../services/reminderService");

describe("Notifications & Date Reminder System", () => {
  let user, token, application;

  beforeAll(async () => {
    // Setup test user
    const res = await request(app).post("/api/auth/signup").send({
      email: "remindertest@example.com",
      password: "TestPass123!",
      name: "Reminder User",
    });
    token = res.body.token;

    user = await prisma.user.findUnique({
      where: { email: "remindertest@example.com" },
    });
  }, 15000);

  afterAll(async () => {
    if (user) {
      await prisma.notification.deleteMany({ where: { userId: user.id } });
      await prisma.application.deleteMany({ where: { userId: user.id } });
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    await prisma.$disconnect();
  }, 15000);

  it("schedules a 7-day reminder when date is in 7 days", async () => {
    const future7Days = new Date();
    future7Days.setDate(future7Days.getDate() + 7);

    const createdAt10DaysAgo = new Date();
    createdAt10DaysAgo.setDate(createdAt10DaysAgo.getDate() - 10);

    const appRecord = await prisma.application.create({
      data: {
        company: "Google",
        role: "Frontend Engineer",
        status: "Interview",
        followUpDate: future7Days,
        userId: user.id,
        createdAt: createdAt10DaysAgo,
      },
    });

    await checkApplicationReminders(appRecord, true);

    const notifications = await prisma.notification.findMany({
      where: { applicationId: appRecord.id },
    });

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe("REMINDER_7_DAYS");
    expect(notifications[0].title).toBe("🔔 Upcoming Interview");
    expect(notifications[0].message).toContain("Google");
    expect(notifications[0].isRead).toBe(false);

    // Clean up test app
    await prisma.application.delete({ where: { id: appRecord.id } });
  });

  it("schedules a 1-day reminder when date is tomorrow", async () => {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 18); // ~18 hours from now (1-day window)

    const appRecord = await prisma.application.create({
      data: {
        company: "Stripe",
        role: "Fullstack Engineer",
        status: "OA",
        followUpDate: tomorrow,
        userId: user.id,
      },
    });

    await checkApplicationReminders(appRecord, true);

    const notifications = await prisma.notification.findMany({
      where: { applicationId: appRecord.id },
    });

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe("REMINDER_1_DAY");
    expect(notifications[0].title).toBe("🔔 Upcoming Assessment");
    expect(notifications[0].message).toContain("Stripe");

    // Clean up test app
    await prisma.application.delete({ where: { id: appRecord.id } });
  });

  it("prevents duplicate reminders for the same date & type", async () => {
    const future7Days = new Date();
    future7Days.setDate(future7Days.getDate() + 7);

    const createdAt10DaysAgo = new Date();
    createdAt10DaysAgo.setDate(createdAt10DaysAgo.getDate() - 10);

    const appRecord = await prisma.application.create({
      data: {
        company: "Vercel",
        role: "Infrastructure Engineer",
        status: "Applied",
        followUpDate: future7Days,
        userId: user.id,
        createdAt: createdAt10DaysAgo,
      },
    });

    // Call check twice
    await checkApplicationReminders(appRecord, true);
    await checkApplicationReminders(appRecord, true);

    const notifications = await prisma.notification.findMany({
      where: { applicationId: appRecord.id },
    });

    expect(notifications.length).toBe(1);

    await prisma.application.delete({ where: { id: appRecord.id } });
  });

  it("suppresses reminder generation when remindersEnabled is false", async () => {
    const future7Days = new Date();
    future7Days.setDate(future7Days.getDate() + 7);

    const appRecord = await prisma.application.create({
      data: {
        company: "Netflix",
        role: "UI Engineer",
        status: "Applied",
        followUpDate: future7Days,
        userId: user.id,
      },
    });

    await checkApplicationReminders(appRecord, false);

    const notifications = await prisma.notification.findMany({
      where: { applicationId: appRecord.id },
    });

    expect(notifications.length).toBe(0);

    await prisma.application.delete({ where: { id: appRecord.id } });
  });

  it("cancels obsolete notifications when application date changes", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() + 7);

    const appRecord = await prisma.application.create({
      data: {
        company: "Meta",
        role: "Product Manager",
        status: "Applied",
        followUpDate: oldDate,
        userId: user.id,
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
    });

    await checkApplicationReminders(appRecord, true);

    let notifs = await prisma.notification.findMany({
      where: { applicationId: appRecord.id },
    });
    expect(notifs.length).toBe(1);

    // Update followUpDate to null
    await prisma.application.update({
      where: { id: appRecord.id },
      data: { followUpDate: null },
    });

    await handleApplicationDateChange(appRecord.id, null);

    notifs = await prisma.notification.findMany({
      where: { applicationId: appRecord.id, isRead: false },
    });
    expect(notifs.length).toBe(0);

    await prisma.application.delete({ where: { id: appRecord.id } });
  });

  it("fetches, marks as read, and deletes notifications via API", async () => {
    // Create a sample notification directly
    const notif = await prisma.notification.create({
      data: {
        userId: user.id,
        title: "🔔 Test Notification",
        message: "Your interview is coming up.",
        type: "REMINDER_7_DAYS",
        eventDate: new Date(),
      },
    });

    // GET /api/notifications
    const getRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.notifications.length).toBeGreaterThanOrEqual(1);
    expect(getRes.body.unreadCount).toBeGreaterThanOrEqual(1);

    // PATCH /api/notifications/:id/read
    const readRes = await request(app)
      .patch(`/api/notifications/${notif.id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.isRead).toBe(true);

    // DELETE /api/notifications/:id
    const delRes = await request(app)
      .delete(`/api/notifications/${notif.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(204);
  });
});
