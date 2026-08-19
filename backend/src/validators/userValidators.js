const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().trim().max(100).optional().or(z.literal("")),
  targetRole: z.string().trim().max(100).optional().or(z.literal("")),
  weeklyGoal: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { updateProfileSchema };