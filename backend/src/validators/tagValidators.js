const { z } = require("zod");

const tagColorEnum = z.enum(["blue", "green", "purple", "orange", "red", "gray"]);

const createTagSchema = z.object({
  name: z.string().trim().min(1).max(50),
  color: tagColorEnum.optional(),
});

module.exports = { createTagSchema, tagColorEnum };