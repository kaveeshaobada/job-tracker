const request = require("supertest");
const app = require("../app");
const prisma = require("../prisma");

jest.setTimeout(15000);

describe("Contacts routes", () => {
    const userA = { email: "contactsa@example.com", password: "TestPass123" };
    const userB = { email: "contactsb@example.com", password: "TestPass123" };
    let tokenA, tokenB, contactIdA;

    beforeAll(async () => {
        const resA = await request(app).post("/api/auth/signup").send(userA);
        tokenA = resA.body.token;
        const resB = await request(app).post("/api/auth/signup").send(userB);
        tokenB = resB.body.token;
    }, 15000);

    afterAll(async () => {
        await prisma.contact.deleteMany({
            where: { user: { email: { in: [userA.email, userB.email] } } },
        });
        await prisma.user.deleteMany({
            where: { email: { in: [userA.email, userB.email] } },
        });
        await prisma.$disconnect();
    }, 15000);

    it("creates a contact", async () => {
        const res = await request(app)
            .post("/api/contacts")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ name: "Jane Recruiter", role: "Recruiter", company: "Google", email: "jane@google.com" });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Jane Recruiter");
        contactIdA = res.body.id;
    });

    it("rejects a contact with no name", async () => {
        const res = await request(app)
            .post("/api/contacts")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ role: "Recruiter" });

        expect(res.status).toBe(400);
    });

    it("lists only the authenticated user's contacts", async () => {
        const res = await request(app)
            .get("/api/contacts")
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("prevents a different user from updating someone else's contact", async () => {
        const res = await request(app)
            .put(`/api/contacts/${contactIdA}`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ name: "Hacked" });

        expect(res.status).toBe(404);
    });

    it("prevents a different user from deleting someone else's contact", async () => {
        const res = await request(app)
            .delete(`/api/contacts/${contactIdA}`)
            .set("Authorization", `Bearer ${tokenB}`);

        expect(res.status).toBe(404);
    });

    it("allows the owner to update their own contact", async () => {
        const res = await request(app)
            .put(`/api/contacts/${contactIdA}`)
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ name: "Jane Senior Recruiter" });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe("Jane Senior Recruiter");
    });

    it("allows the owner to delete their own contact", async () => {
        const res = await request(app)
            .delete(`/api/contacts/${contactIdA}`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(204);
    });
});