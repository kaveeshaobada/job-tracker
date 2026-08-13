const { z } = require("zod");

const applicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(200),
  role: z.string().trim().min(1, "Role is required").max(200),
  status: z.enum(["Applied", "OA", "Interview", "Offer", "Rejected"]).optional(),
  link: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")).nullable(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")).nullable(),
});

module.exports = { applicationSchema };