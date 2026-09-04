const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");

jest.setTimeout(15000);

describe("Users/Settings routes", () => {
    const user = { email: "settingsuser@example.com", password: "TestPass123" };
    let token;

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/signup").send(user);
        token = res.body.token;
    }, 15000);

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: user.email } });
        await prisma.$disconnect();
    }, 15000);

    it("rejects unauthenticated requests", async () => {
        const res = await request(app).get("/api/users/me");
        expect(res.status).toBe(401);
    });

    it("fetches the authenticated user's profile", async () => {
        const res = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(user.email);
    });

    it("updates the profile", async () => {
        const res = await request(app)
            .put("/api/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Test User", targetRole: "SWE Intern", weeklyGoal: 10 });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Test User");
        expect(res.body.weeklyGoal).toBe(10);
    });

    it("rejects an invalid weekly goal", async () => {
        const res = await request(app)
            .put("/api/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send({ weeklyGoal: -5 });

        expect(res.status).toBe(400);
    });
});