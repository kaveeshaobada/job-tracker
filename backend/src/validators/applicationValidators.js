const { z } = require("zod");

const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(200),
  status: z.enum(["Applied", "OA", "Interview", "Offer", "Rejected"]).optional(),
  link: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
  tagNames: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
});

const activityLogSchema = z.object({
  content: z.string().trim().min(1, "Note cannot be empty").max(2000),
});

module.exports = { applicationSchema, activityLogSchema };