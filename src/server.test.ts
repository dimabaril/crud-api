import http from "http";
import { AddressInfo } from "net";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./handlers";

const createTestServer = () => {
  return http.createServer((req, res) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const method = req.method;
    const path = url.pathname;

    if (path === "/api/users" && method === "GET") {
      getUsers(req, res);
    } else if (path?.startsWith("/api/users/") && method === "GET") {
      const userId = path.split("/")[3];
      getUserById(req, res, userId);
    } else if (path === "/api/users" && method === "POST") {
      createUser(req, res);
    } else if (path?.startsWith("/api/users/") && method === "PUT") {
      const userId = path.split("/")[3];
      updateUser(req, res, userId);
    } else if (path?.startsWith("/api/users/") && method === "DELETE") {
      const userId = path.split("/")[3];
      deleteUser(req, res, userId);
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  });
};

const makeRequest = (
  options: http.RequestOptions,
  body?: any,
): Promise<{ statusCode: number; body: any }> => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(data || "{}");
        } catch (e) {
          parsedBody = data;
        }
        resolve({
          statusCode: res.statusCode!,
          body: parsedBody,
        });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
};

describe("CRUD API", () => {
  let server: http.Server;
  let port: number;
  let userId: string;

  beforeAll((done) => {
    server = createTestServer();
    server.listen(() => {
      port = (server.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it("should get all users (empty array)", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port,
      path: "/api/users",
      method: "GET",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should create a new user", async () => {
    const newUser = { username: "John Doe", age: 30, hobbies: ["reading"] };
    const response = await makeRequest(
      {
        hostname: "localhost",
        port,
        path: "/api/users",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      newUser,
    );
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(newUser);
    userId = response.body.id;
  });

  it("should get the created user by id", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port,
      path: `/api/users/${userId}`,
      method: "GET",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it("should update the created user", async () => {
    const updatedUser = {
      username: "John Smith",
      age: 35,
      hobbies: ["writing"],
    };
    const response = await makeRequest(
      {
        hostname: "localhost",
        port,
        path: `/api/users/${userId}`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
      updatedUser,
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject(updatedUser);
    expect(response.body.id).toBe(userId);
  });

  it("should delete the created user", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port,
      path: `/api/users/${userId}`,
      method: "DELETE",
    });
    expect(response.statusCode).toBe(204);
  });

  it("should return 404 for deleted user", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port,
      path: `/api/users/${userId}`,
      method: "GET",
    });
    expect(response.statusCode).toBe(404);
  });
});
