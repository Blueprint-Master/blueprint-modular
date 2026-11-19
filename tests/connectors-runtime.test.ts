import { afterAll, beforeAll, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { runConnector } from "../lib/connectors/runtime";

let receiver: Server;
let endpoint: string;
const observed: { url: string; method: string; body: string; auth?: string; apiKey?: string }[] = [];
const vaultValues = new Map([
  ["baseUrl", "https://feed.example.test/api"], ["apiKey", "fixture-key"],
  ["secretKey", "test-only"], ["spreadsheetId", "sheet-1"], ["webhookUrl","https://hooks.slack.com/services/test"],
]);
const bindings = {
  vault: { async get(app: string, _connector: string, key: string) {
    expect(app).toBe("app-a");
    return vaultValues.get(key) ?? "";
  }},
  restOrigin: "https://feed.example.test",
  sheetsAccessToken: async () => "test-access",
  transport: (async (input, init) => {
    const url = new URL(input.toString());
    return fetch(endpoint + url.pathname + url.search, init);
  }) as typeof fetch,
};
beforeAll(async () => {
  receiver = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    observed.push({ url:req.url!,method:req.method!,body:Buffer.concat(chunks).toString(),auth:req.headers.authorization,apiKey:req.headers["x-api-key"] as string });
    if (req.url?.startsWith("/api/missing")) { res.writeHead(503).end("do not expose fixture details"); return; }
    if (req.url?.startsWith("/api/")) res.end(JSON.stringify({items:[{id:42,title:"Live supplier"}]}));
    else if (req.url?.includes("/values/")) res.end(JSON.stringify({values:[["Amiens","open","3"]]}));
    else if (req.url?.startsWith("/v1/charges")) res.end(JSON.stringify({data:[{id:"charge",amount:1050,currency:"eur",created:100,status:"succeeded"}]}));
    else res.end("ok");
  });
  await new Promise<void>((resolve) => receiver.listen(0,"127.0.0.1",resolve));
  endpoint = "http://127.0.0.1:"+(receiver.address() as AddressInfo).port;
});
afterAll(async () => { await new Promise<void>((resolve) => receiver.close(() => resolve())); });

it("executes and maps all four configured connectors using real requests to an isolated receiver", async () => {
  const run = (id: string, operation: string, args: Record<string,string|number>) => runConnector(bindings,"app-a",id,operation,args);
  expect(await run("rest-generic","listResource",{resource:"suppliers"})).toMatchObject([{id:42,label:"Live supplier"}]);
  expect(observed.at(-1)).toMatchObject({url:"/api/suppliers?limit=10",apiKey:"fixture-key"});
  expect(await run("google-sheets","readRange",{range:"Sheet1!A1:C1"})).toEqual([{site:"Amiens",status:"open",count:3}]);
  expect(observed.at(-1)?.auth).toBe("Bearer test-access");
  expect(await run("stripe","listCharges",{limit:2})).toMatchObject([{id:"charge",amount:10.5}]);
  expect(observed.at(-1)).toMatchObject({url:"/v1/charges?limit=2",auth:"Bearer test-only"});
  expect(await run("outgoing-webhook","postMessage",{text:"QA only"})).toEqual({delivered:true,httpStatus:200});
  expect(JSON.parse(observed.at(-1)!.body)).toEqual({text:"QA only"});
  await expect(run("rest-generic","listResource",{resource:"missing"})).rejects.toThrow("Upstream HTTP 503");
});

it("rejects unknown operations, unbound spreadsheets, origins and input before transport", async () => {
  const count = observed.length;
  await expect(runConnector(bindings,"app-a","google-sheets","readRange",{spreadsheetId:"other",range:"A1"})).rejects.toThrow("bound");
  await expect(runConnector({...bindings,restOrigin:"https://elsewhere.test"},"app-a","rest-generic","listResource",{resource:"orders"})).rejects.toThrow("destination");
  await expect(runConnector(bindings,"app-a","stripe","listCharges",{limit:-1})).rejects.toThrow("Limit");
  expect(observed).toHaveLength(count);
});
