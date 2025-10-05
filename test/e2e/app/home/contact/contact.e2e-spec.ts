import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { paginationFilter } from "test/e2e/contacts/mocks/contact-result.mock";
import { AppModule } from "@/app.module";

describe("ContactController (e2e)", () => {
    let app: INestApplication;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it("/contacts (GET) should return paginated contacts", async () => {

        const res = await request(app.getHttpServer())
            .get("/contacts")
            .query(paginationFilter);

        expect(res.status).toBe(200);
        
        const requiredProperties = [
            'currentPage',
            'totalElements',
            'nextPage',
            'lastPage',
            'firstPage',
            'previousPage'
        ];
        
        requiredProperties.forEach(property => {
            expect(res.body).toHaveProperty(property);
        });

         expect(res.body).toHaveProperty("nextPage", 2);
    });

    it("/contacts/:id (GET) should return a contact", async () => {
        const res = await request(app.getHttpServer()).get("/contacts/105312");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: 105312,
            uuid: 105312,
            companyName: "Biblioteca Jorge Amado",
            phoneNumber: "(11) 4157-1702",
            email: "",
            address: "Rua Osvaldo Goeldi, s/n",
            logoUrl: null,
            level: "f"
        });
    });

    it("/contacts/:id (GET) should return 200 with undefined if not found", async () => {
        const res = await request(app.getHttpServer()).get("/contacts/1");
        expect(res.status).toBe(200);
        expect(res.body).toStrictEqual({});
    });
});
