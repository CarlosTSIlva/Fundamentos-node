import req from "supertest";
import { isUuid } from "uuidv4";
import app from "../app";

describe("Transaction", () => {
  it("should be able to create a new transaction", async () => {
    const res = await req(app).post("/transactions").send({
      title: "Loan",
      type: "income",
      value: 1200,
    });

    expect(isUuid(res.body.id)).toBe(true);

    expect(res.body).toMatchObject({
      title: "Loan",
      type: "income",
      value: 1200,
    });
  });

  it("should be able to list the transactions", async () => {
    await req(app).post("/transactions").send({
      title: "Salary",
      type: "income",
      value: 3000,
    });

    await req(app).post("/transactions").send({
      title: "Bicycle",
      type: "outcome",
      value: 1500,
    });

    const res = await req(app).get("/transactions");

    expect(res.body.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: "Salary",
          type: "income",
          value: 3000,
        }),
        expect.objectContaining({
          id: expect.any(String),
          title: "Bicycle",
          type: "outcome",
          value: 1500,
        }),
        expect.objectContaining({
          id: expect.any(String),
          title: "Loan",
          type: "income",
          value: 1200,
        }),
      ])
    );

    expect(res.body.balance).toMatchObject({
      income: 4200,
      outcome: 1500,
      total: 2700,
    });
  });

  it("should not be able to create outcome transaction without a valid balance", async () => {
    const res = await req(app).post("/transactions").send({
      title: "Bicycle",
      type: "outcome",
      value: 3000,
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });
});
