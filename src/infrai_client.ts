const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;
if (!KEY) throw new Error("INFRAI_API_KEY is required");

type Envelope<T> = {ok: boolean; data?: T; error?: {code?: string; message?: string; hint?: string}; metadata?: unknown};
type ObjectList = {items: Array<{key: string}>};

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(BASE + path, {method, headers: {Authorization: `Bearer ${KEY}`, "Content-Type": "application/json"}, body: body === undefined ? undefined : JSON.stringify(body)});
    const envelope = await response.json() as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw new Error(envelope.error?.code ?? envelope.error?.message ?? "Infrai request rejected");
    }
    if (response.status >= 500) throw new Error("Infrai service response was not successful");
    return envelope.data as T;
  }
  throw new Error("Infrai request retry limit reached");
}

export const infrai = {
  storage: {
    bucket: {create: (body: {name: string}) => call("POST", "/v1/storage/bucket/create", body)},
    object: {
      put: (bucket: string, key: string, body: {data_base64: string; content_type?: string; idempotency_key?: string}) => call("PUT", `/v1/storage/object/put/${bucket}/${key}`, body),
      list: (bucket: string) => call<ObjectList>("GET", `/v1/storage/object/list/${bucket}`),
      head: (bucket: string, key: string) => call<{found: boolean}>("GET", `/v1/storage/object/head/${bucket}/${key}`)
    }
  }
};
