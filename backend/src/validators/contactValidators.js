const { z } = require("zod");

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  role: z.string().trim().max(150).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  applicationId: z.coerce.number().int().optional().nullable(),
});

module.exports = { contactSchema };