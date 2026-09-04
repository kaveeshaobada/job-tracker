const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");

jest.setTimeout(15000);

describe("Applications routes", () => {
  const userA = { email: "usera@example.com", password: "TestPass123" };
  const userB = { email: "userb@example.com", password: "TestPass123" };
  let tokenA, tokenB, appIdA;

  beforeAll(async () => {
    const resA = await request(app).post("/api/auth/signup").send(userA);
    tokenA = resA.body.token;

    const resB = await request(app).post("/api/auth/signup").send(userB);
    tokenB = resB.body.token;
  }, 15000);

  afterAll(async () => {
    await prisma.application.deleteMany({
      where: { user: { email: { in: [userA.email, userB.email] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [userA.email, userB.email] } },
    });
    await prisma.$disconnect();
  }, 15000);

  describe("POST /api/applications", () => {
    it("rejects requests with no auth token", async () => {
      const res = await request(app)
        .post("/api/applications")
        .send({ company: "Google", role: "SWE Intern" });
      expect(res.status).toBe(401);
    });

    it("creates an application for the authenticated user", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ company: "Google", role: "SWE Intern" });

      expect(res.status).toBe(201);
      expect(res.body.company).toBe("Google");
      appIdA = res.body.id;
    });

    it("rejects a request missing required fields", async () => {
      const res = await request(app)
        .post("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ company: "Google" }); // missing role
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/applications", () => {
    it("only returns the authenticated user's applications", async () => {
      const res = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.every((a) => a.company === "Google")).toBe(true);
    });

    it("returns an empty list for a user with no applications", async () => {
      const res = await request(app)
        .get("/api/applications")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("PUT /api/applications/:id", () => {
    it("updates the owner's own application", async () => {
      const res = await request(app)
        .put(`/api/applications/${appIdA}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ company: "Google", role: "SWE Intern", status: "Interview" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Interview");
    });

    it("prevents a different user from updating someone else's application", async () => {
      const res = await request(app)
        .put(`/api/applications/${appIdA}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ company: "Hacked", role: "Hacked", status: "Offer" });

      expect(res.status).toBe(404); // should not reveal it exists
    });
  });

  describe("DELETE /api/applications/:id", () => {
    it("prevents a different user from deleting someone else's application", async () => {
      const res = await request(app)
        .delete(`/api/applications/${appIdA}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it("allows the owner to delete their own application", async () => {
      const res = await request(app)
        .delete(`/api/applications/${appIdA}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(204);
    });

    describe("Tags", () => {
      it("creates an application with tags", async () => {
        const res = await request(app)
          .post("/api/applications")
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ company: "Meta", role: "SWE", tagNames: ["Referral", "Remote"] });

        expect(res.status).toBe(201);
        expect(res.body.tags.map((t) => t.name).sort()).toEqual(["Referral", "Remote"]);
      });

      it("updates an application's tags", async () => {
        const create = await request(app)
          .post("/api/applications")
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ company: "Netflix", role: "SWE", tagNames: ["Dream company"] });

        const res = await request(app)
          .put(`/api/applications/${create.body.id}`)
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ company: "Netflix", role: "SWE", status: "Applied", tagNames: ["Dream company", "Remote"] });

        expect(res.status).toBe(200);
        expect(res.body.tags.length).toBe(2);
      });
    });

    describe("Notes (activity log)", () => {
      let noteAppId;

      beforeAll(async () => {
        const res = await request(app)
          .post("/api/applications")
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ company: "Amazon", role: "SDE Intern" });
        noteAppId = res.body.id;
      });

      it("adds a note to an application", async () => {
        const res = await request(app)
          .post(`/api/applications/${noteAppId}/notes`)
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ content: "Recruiter screen went well" });

        expect(res.status).toBe(201);
        expect(res.body.content).toBe("Recruiter screen went well");
      });

      it("rejects an empty note", async () => {
        const res = await request(app)
          .post(`/api/applications/${noteAppId}/notes`)
          .set("Authorization", `Bearer ${tokenA}`)
          .send({ content: "" });

        expect(res.status).toBe(400);
      });

      it("prevents a different user from adding a note to someone else's application", async () => {
        const res = await request(app)
          .post(`/api/applications/${noteAppId}/notes`)
          .set("Authorization", `Bearer ${tokenB}`)
          .send({ content: "Hacked note" });

        expect(res.status).toBe(404);
      });
    });

    describe("Stats and export", () => {
      it("returns stats for the authenticated user", async () => {
        const res = await request(app)
          .get("/api/applications/stats")
          .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("total");
        expect(res.body).toHaveProperty("weeklyGoal");
      });

      it("exports applications as CSV", async () => {
        const res = await request(app)
          .get("/api/applications/export")
          .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toContain("text/csv");
      });
    });
  });
});