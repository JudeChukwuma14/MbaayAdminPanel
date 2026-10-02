const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const ts = require("typescript");
const axios = require("axios");
const { configureStore } = require("@reduxjs/toolkit");

const projectRoot = path.resolve(__dirname, "..");
const sliceFile = path.join(projectRoot, "src/components/redux/slices/adminSlice.ts");
const storeFile = path.join(projectRoot, "src/components/redux/store.ts");
const sessionFile = path.join(projectRoot, "src/services/authSession.ts");

// Run the application's TypeScript with its real Redux reducer and Axios
// interceptors. Only the browser store and HTTP adapter are supplied by tests.
function moduleLoader(overrides = new Map()) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    function localRequire(specifier) {
      if (overrides.has(specifier)) return overrides.get(specifier);
      if (!specifier.startsWith(".")) return require(specifier);
      const resolved = path.resolve(path.dirname(filename), specifier);
      const source = [resolved, `${resolved}.ts`, `${resolved}.tsx`]
        .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!source) throw new Error(`Cannot resolve ${specifier} from ${filename}`);
      return load(source);
    }
    const execute = vm.runInThisContext(
      `(function(exports, require, module, __filename, __dirname) {\n${compiled}\n})`,
      { filename },
    );
    execute(module.exports, localRequire, module, filename, path.dirname(filename));
    return module.exports;
  }
  return load;
}

let tokenNumber = 0;
function accessToken(secondsFromNow = 3600, role = "Admin") {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    exp: Math.floor(Date.now() / 1000) + secondsFromNow,
    role,
    jti: ++tokenNumber,
  })}.signature`;
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function httpResponse(config, status = 200, data = {}) {
  const response = { config, status, data, statusText: String(status), headers: {} };
  if (status >= 400) {
    throw new axios.AxiosError(
      `Request failed with status code ${status}`,
      axios.AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      response,
    );
  }
  return response;
}

function setup(adapter, { token = accessToken(), refreshToken = "opaque-refresh-token" } = {}) {
  const slice = moduleLoader()(sliceFile);
  const store = configureStore({ reducer: { admin: slice.default } });
  store.dispatch(slice.setAdmin({
    admin: { id: "account-a", name: "Admin A" }, token, refreshToken, role: "Admin",
  }));
  const requests = [];
  const recordAdapter = async (config) => {
    requests.push({
      url: config.url,
      authorization: config.headers.get("Authorization"),
      data: typeof config.data === "string" ? JSON.parse(config.data) : config.data,
    });
    return adapter(config);
  };
  const http = axios.create({ adapter: recordAdapter });
  http.create = (config) => axios.create({ ...config, adapter: recordAdapter });
  http.isAxiosError = axios.isAxiosError;
  const session = moduleLoader(new Map([
    ["axios", { __esModule: true, default: http, AxiosHeaders: axios.AxiosHeaders }],
    ["../components/redux/store", { __esModule: true, default: store }],
  ]))(sessionFile);
  return {
    store, slice, session, requests,
    api: session.createAuthenticatedApi("https://example.test/admin"),
  };
}

const isRefresh = (config) => config.url.endsWith("/refresh_token");
const emptySession = { admin: null, token: null, refreshToken: null, role: null };
function sessionCredentials(store) {
  const { admin, token, refreshToken, role } = store.getState().admin;
  return { admin, token, refreshToken, role };
}

test("fresh login replaces the old account and clears a missing refresh token", () => {
  const { store, slice } = setup(() => { throw new Error("Unexpected HTTP request"); });
  const token = accessToken();
  store.dispatch(slice.setAdmin({
    admin: { id: "account-b", name: "Admin B" }, token, role: "Customer care",
  }));
  assert.deepEqual(sessionCredentials(store), {
    admin: { id: "account-b", name: "Admin B" }, token, refreshToken: null, role: "Customer care",
  });
});

test("the application store persists and restores the complete admin session", async () => {
  const saved = new Map();
  const storage = {
    getItem: async (key) => saved.get(key) ?? null,
    setItem: async (key, value) => { saved.set(key, value); },
    removeItem: async (key) => { saved.delete(key); },
  };
  const overrides = new Map([["redux-persist/lib/storage", storage]]);
  const firstLoad = moduleLoader(overrides);
  const first = firstLoad(storeFile);
  async function bootstrapped(persistor) {
    if (persistor.getState().bootstrapped) return;
    await new Promise((resolve) => {
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) { unsubscribe(); resolve(); }
      });
    });
  }
  try {
    await bootstrapped(first.persistor);
    first.default.dispatch(firstLoad(sliceFile).setAdmin({
      admin: { id: "account-a", name: "Admin A" },
      token: accessToken(-60), refreshToken: "opaque-saved-refresh", role: "Admin",
    }));
    await first.persistor.flush();
    const second = moduleLoader(overrides)(storeFile);
    try {
      await bootstrapped(second.persistor);
      assert.deepEqual(second.default.getState().admin, first.default.getState().admin);
      assert.ok(saved.has("persist:root"));
    } finally {
      second.persistor.pause();
    }
  } finally {
    first.persistor.pause();
  }
});

test("an expired restored access token renews with an opaque refresh token before calling the API", async () => {
  const renewed = accessToken(3600, "Super Admin");
  const { api, store, requests } = setup((config) => isRefresh(config)
    ? httpResponse(config, 200, { data: { accessToken: renewed } })
    : httpResponse(config, 200, { ok: true }), { token: accessToken(-60) });
  await api.get("/dashboard");
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].data, { refreshToken: "opaque-refresh-token" });
  assert.equal(requests[1].authorization, `Bearer ${renewed}`);
  assert.equal(store.getState().admin.refreshToken, "opaque-refresh-token");
  assert.equal(store.getState().admin.role, "Super Admin");
});

test("concurrent expired-token requests share one refresh and use rotated tokens", async () => {
  const started = deferred();
  const release = deferred();
  const renewed = accessToken();
  let refreshCount = 0;
  const { api, store } = setup(async (config) => {
    if (!isRefresh(config)) return httpResponse(config, 200, config.headers.get("Authorization"));
    refreshCount += 1;
    started.resolve();
    await release.promise;
    return httpResponse(config, 200, { accessToken: renewed, refreshToken: "rotated-refresh" });
  }, { token: accessToken(-60) });
  const first = api.get("/dashboard");
  const second = api.get("/vendors");
  await started.promise;
  await new Promise(setImmediate);
  assert.equal(refreshCount, 1);
  release.resolve();
  const results = await Promise.all([first, second]);
  assert.ok(results.every((result) => result.data === `Bearer ${renewed}`));
  assert.equal(store.getState().admin.refreshToken, "rotated-refresh");
});

test("a late 401 retries with the already renewed token after refresh-token rotation", async () => {
  const old = accessToken();
  const renewed = accessToken();
  const lateStarted = deferred();
  const releaseLate = deferred();
  let refreshCount = 0;
  const { api } = setup(async (config) => {
    if (isRefresh(config)) {
      refreshCount += 1;
      return httpResponse(config, 200, { token: renewed, refreshToken: "rotated-refresh" });
    }
    if (config.headers.get("Authorization") === `Bearer ${old}`) {
      if (config.url === "/late") {
        lateStarted.resolve();
        await releaseLate.promise;
      }
      return httpResponse(config, 401, { message: "Unauthorized" });
    }
    return httpResponse(config, 200, config.headers.get("Authorization"));
  }, { token: old });
  const early = api.get("/early");
  const late = api.get("/late");
  // Keep a rejection observed even if the implementation regresses before await.
  late.catch(() => {});
  await lateStarted.promise;
  assert.equal((await early).data, `Bearer ${renewed}`);
  releaseLate.resolve();
  assert.equal((await late).data, `Bearer ${renewed}`);
  assert.equal(refreshCount, 1);
});

test("concurrent 401 responses share one refresh and both retry successfully", async () => {
  const old = accessToken();
  const renewed = accessToken();
  const started = deferred();
  const release = deferred();
  let refreshCount = 0;
  const { api } = setup(async (config) => {
    if (isRefresh(config)) {
      refreshCount += 1;
      started.resolve();
      await release.promise;
      return httpResponse(config, 200, { token: renewed, refreshToken: "rotated-refresh" });
    }
    if (config.headers.get("Authorization") === `Bearer ${old}`) {
      return httpResponse(config, 401, { message: "Unauthorized" });
    }
    return httpResponse(config, 200, config.headers.get("Authorization"));
  }, { token: old });
  const first = api.get("/dashboard");
  const second = api.get("/vendors");
  await started.promise;
  await new Promise(setImmediate);
  assert.equal(refreshCount, 1);
  release.resolve();
  const responses = await Promise.all([first, second]);
  assert.ok(responses.every((response) => response.data === `Bearer ${renewed}`));
  assert.equal(refreshCount, 1);
});

for (const failure of ["offline", 503]) {
  test(`refresh ${failure} failure preserves the saved session`, async () => {
    const { api, store } = setup((config) => {
      if (!isRefresh(config)) throw new Error("Private API must wait for renewal");
      if (failure === "offline") throw new axios.AxiosError("Network Error", "ERR_NETWORK", config);
      return httpResponse(config, failure, { message: "Service unavailable" });
    }, { token: accessToken(-60) });
    const before = store.getState().admin;
    await assert.rejects(api.get("/dashboard"));
    assert.deepEqual(store.getState().admin, before);
  });
}

for (const status of [401, 403, 400]) {
  test(`a rejected refresh token (${status}) logs out`, async () => {
    const { session, store } = setup((config) =>
      httpResponse(config, status, { message: "Refresh token is expired" }));
    await assert.rejects(session.refreshAdminSession());
    assert.deepEqual(sessionCredentials(store), emptySession);
  });
}

test("permission-denied 403 does not refresh or erase a valid session", async () => {
  const { api, store, requests } = setup((config) =>
    httpResponse(config, 403, { message: "You do not have permission to manage vendors" }));
  const before = store.getState().admin;
  await assert.rejects(api.get("/vendors"));
  assert.equal(requests.length, 1);
  assert.deepEqual(store.getState().admin, before);
});

test("a public login failure never renews or sends the previous account token", async () => {
  const { api, store, requests } = setup((config) =>
    httpResponse(config, 401, { message: "Invalid credentials" }), { token: accessToken(-60) });
  const before = store.getState().admin;
  await assert.rejects(api.post("/login_admin", { email: "admin@example.test", password: "bad" }));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].authorization, undefined);
  assert.deepEqual(store.getState().admin, before);
});

for (const change of ["logout", "account switch"]) {
  test(`${change} during renewal prevents the old session from being restored`, async () => {
    const started = deferred();
    const release = deferred();
    const { session, store, slice } = setup(async (config) => {
      started.resolve();
      await release.promise;
      return httpResponse(config, 200, { token: accessToken(), refreshToken: "old-account-rotated" });
    });
    const refresh = session.refreshAdminSession();
    await started.promise;
    if (change === "logout") store.dispatch(slice.logout());
    else store.dispatch(slice.setAdmin({
      admin: { id: "account-b", name: "Admin B" }, token: accessToken(),
      refreshToken: "account-b-refresh", role: "Admin",
    }));
    const expected = store.getState().admin;
    release.resolve();
    await assert.rejects(refresh);
    assert.deepEqual(store.getState().admin, expected);
  });
}

test("an old account's refresh rejection cannot log out the replacement account", async () => {
  const started = deferred();
  const release = deferred();
  const { session, store, slice } = setup(async (config) => {
    started.resolve();
    await release.promise;
    return httpResponse(config, 401, { message: "Refresh token is revoked" });
  });
  const refresh = session.refreshAdminSession();
  await started.promise;
  store.dispatch(slice.setAdmin({
    admin: { id: "account-b", name: "Admin B" }, token: accessToken(),
    refreshToken: "account-b-refresh", role: "Admin",
  }));
  const expected = store.getState().admin;
  release.resolve();
  await assert.rejects(refresh);
  assert.deepEqual(store.getState().admin, expected);
});

test("logging in again with the same token strings still invalidates an older refresh", async () => {
  const started = deferred();
  const release = deferred();
  const { session, store, slice } = setup(async (config) => {
    started.resolve();
    await release.promise;
    return httpResponse(config, 200, { token: accessToken(), refreshToken: "stale-rotation" });
  });
  const previous = store.getState().admin;
  const refresh = session.refreshAdminSession();
  await started.promise;
  store.dispatch(slice.logout());
  store.dispatch(slice.setAdmin({
    admin: previous.admin, token: previous.token, refreshToken: previous.refreshToken, role: previous.role,
  }));
  const expected = store.getState().admin;
  release.resolve();
  await assert.rejects(refresh);
  assert.deepEqual(store.getState().admin, expected);
});

test("an API rejecting the renewed token logs out after one retry", async () => {
  let refreshCount = 0;
  let privateCount = 0;
  const { api, store } = setup((config) => {
    if (isRefresh(config)) {
      refreshCount += 1;
      return httpResponse(config, 200, { token: accessToken() });
    }
    privateCount += 1;
    return httpResponse(config, 401, { message: "Unauthorized" });
  });
  await assert.rejects(api.get("/dashboard"));
  assert.equal(refreshCount, 1);
  assert.equal(privateCount, 2);
  assert.deepEqual(sessionCredentials(store), emptySession);
});
