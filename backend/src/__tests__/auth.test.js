const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");

jest.setTimeout(15000); // allow up to 15s per test, for Neon cold starts

describe("Auth routes", () => {
  const testUser = { email: "jesttest@example.com", password: "TestPass123" };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  }, 15000);

  describe("POST /api/auth/signup", () => {
    it("creates a new user with valid data", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("rejects a duplicate email", async () => {
      const res = await request(app).post("/api/auth/signup").send(testUser);
      expect(res.status).toBe(409);
    });

    it("rejects a weak password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ email: "weak@example.com", password: "weak" });
      expect(res.status).toBe(400);
    });

    it("rejects an invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ email: "not-an-email", password: "TestPass123" });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send(testUser);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("rejects wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "WrongPass123" });
      expect(res.status).toBe(401);
    });

    it("rejects a nonexistent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "TestPass123" });
      expect(res.status).toBe(401);
    });
  });
});