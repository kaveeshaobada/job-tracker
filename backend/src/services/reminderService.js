const prisma = require("../prisma");
const logger = require("../logger");

/**
 * Modular Reminder Rules Configuration
 * Easily extendable for additional intervals (e.g. 3 days before)
 */
const REMINDER_INTERVALS = [
  {
    type: "REMINDER_7_DAYS",
    daysBefore: 7,
    minDaysBefore: 1, // Must be > 1 day before event
    minCreationOffsetDays: 6, // Skip if application created less than 6 days before event
    daysText: "7 days",
  },
  {
    type: "REMINDER_1_DAY",
    daysBefore: 1,
    minDaysBefore: 0, // Must be > 0 days before event
    minCreationOffsetDays: 0,
    daysText: "tomorrow",
  },
];

function formatDateDisplay(date) {
  const d = new Date(date);
  const options = { day: "numeric", month: "long" };
  return d.toLocaleDateString("en-US", options);
}

function getTitleForStatus(status) {
  if (status === "Interview") return "🔔 Upcoming Interview";
  if (status === "OA") return "🔔 Upcoming Assessment";
  return "🔔 Upcoming Follow-up";
}

/**
 * Checks and generates reminders for a single application if eligible.
 */
async function checkApplicationReminders(app, userRemindersEnabled = true) {
  if (!app || !app.followUpDate || !userRemindersEnabled) return;

  const now = new Date();
  const eventDate = new Date(app.followUpDate);

  // Rule: Do not send reminders for dates that have already passed
  if (eventDate <= now) return;

  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const createdAt = app.createdAt ? new Date(app.createdAt) : new Date();
  const creationOffsetDays = (eventDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  for (const interval of REMINDER_INTERVALS) {
    // Check if event is within the target interval window
    if (diffDays <= interval.daysBefore && diffDays > interval.minDaysBefore) {
      // Rule: Created less than 7 days before date -> skip 7-day reminder
      if (creationOffsetDays < interval.minCreationOffsetDays) {
        continue;
      }

      const title = getTitleForStatus(app.status);
      const dateFormatted = formatDateDisplay(eventDate);
      const message = `Your ${app.role} application with ${app.company} has an upcoming event ${interval.daysText} — ${dateFormatted}.`;

      try {
        await prisma.notification.create({
          data: {
            userId: app.userId,
            applicationId: app.id,
            title,
            message,
            type: interval.type,
            eventDate,
          },
        });
        logger.info(
          { applicationId: app.id, type: interval.type, eventDate },
          "Created date reminder notification"
        );
      } catch (err) {
        // Unique constraint violation (P2002) means reminder was already generated — safe duplicate prevention
        if (err.code === "P2002") {
          logger.debug({ applicationId: app.id, type: interval.type }, "Reminder already exists, skipped duplicate");
        } else {
          logger.error({ err, applicationId: app.id }, "Error generating reminder notification");
        }
      }
    }
  }
}

/**
 * Sweeps all applications in database to check for upcoming reminders.
 */
async function checkAllReminders() {
  try {
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(now.getDate() + 8); // Look up to 8 days ahead

    const applications = await prisma.application.findMany({
      where: {
        followUpDate: {
          gt: now,
          lte: futureLimit,
        },
        user: {
          remindersEnabled: true,
        },
      },
      include: {
        user: {
          select: { remindersEnabled: true },
        },
      },
    });

    for (const app of applications) {
      await checkApplicationReminders(app, app.user?.remindersEnabled);
    }
  } catch (err) {
    logger.error({ err }, "Error running checkAllReminders sweep");
  }
}

/**
 * Handles application date changes or deletions.
 * Cancels unread notifications for obsolete event dates and checks new dates immediately.
 */
async function handleApplicationDateChange(applicationId, newFollowUpDate = null) {
  try {
    const app = await prisma.application.findUnique({
      where: { id: Number(applicationId) },
      include: { user: { select: { remindersEnabled: true } } },
    });

    if (!app) {
      // Application was deleted — cancel all notifications for this application
      await prisma.notification.deleteMany({
        where: { applicationId: Number(applicationId) },
      });
      return;
    }

    if (!newFollowUpDate) {
      // followUpDate removed — delete unread notifications for this application
      await prisma.notification.deleteMany({
        where: {
          applicationId: app.id,
          isRead: false,
        },
      });
      return;
    }

    const eventDate = new Date(newFollowUpDate);

    // Delete obsolete notifications where eventDate does not match the new followUpDate
    await prisma.notification.deleteMany({
      where: {
        applicationId: app.id,
        eventDate: { not: eventDate },
        isRead: false,
      },
    });

    // Check if immediate reminder applies for the new date
    await checkApplicationReminders(app, app.user?.remindersEnabled);
  } catch (err) {
    logger.error({ err, applicationId }, "Error handling application date change");
  }
}

let schedulerTimer = null;

function startReminderScheduler(intervalMs = 5 * 60 * 1000) { // Default 5 mins
  if (schedulerTimer) clearInterval(schedulerTimer);

  // Initial check on server start
  checkAllReminders();

  schedulerTimer = setInterval(() => {
    checkAllReminders();
  }, intervalMs);

  logger.info("Reminder background scheduler started");
}

function stopReminderScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
}

module.exports = {
  checkApplicationReminders,
  checkAllReminders,
  handleApplicationDateChange,
  startReminderScheduler,
  stopReminderScheduler,
  REMINDER_INTERVALS,
};
