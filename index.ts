import CryptoJS from "crypto-js";

function generateNonce(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function sortAndStringifyParams(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((key) => `${key}${params[key]}`).join("");
}

function generateApiSignature(
  path: string,
  secretKey: string,
  queryParams?: Record<string, any>,
  body?: any,
  contentType?: string
) {
  const nonce = generateNonce();
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const allParams = {
    nonce,
    timestamp,
    ...(queryParams || {}),
  };

  const paramsString = sortAndStringifyParams(allParams);

  // Build: secret + path + sortedParams + body + secret
  let signingString = `${secretKey}${path}${paramsString}`;

  // Add body if not multipart/form-data
  if (contentType !== "multipart/form-data" && body) {
    if (typeof body === "string") {
      signingString += body;
    } else {
      signingString += JSON.stringify(body);
    }
  }

  signingString += secretKey;

  const sign = CryptoJS.HmacSHA256(signingString, secretKey).toString(
    CryptoJS.enc.Hex
  );

  return {
    nonce,
    timestamp,
    sign,
    queryParamsWithSign: { ...allParams, sign },
  };
}

// Example GET
const secretKey =
  "28fe1173c0144941a15c4e72c8c3a24af2ad9b611627803d5976181469c9ace4";
const getResult = generateApiSignature("/api/v1/reminders", secretKey, {
  limit: "20",
  page: "1",
});

// Example POST with body
const postBody = { name: "Water plants", type: "WATERING" };
const postResult = generateApiSignature(
  "/api/v1/reminders",
  secretKey,
  {},
  postBody,
  "application/json"
);

console.log("GET result:", {
  sign: getResult.sign,
  nonce: getResult.nonce,
  timestamp: getResult.timestamp,
});
console.log("POST result:", {
  sign: postResult.sign,
  nonce: postResult.nonce,
  timestamp: postResult.timestamp,
});
