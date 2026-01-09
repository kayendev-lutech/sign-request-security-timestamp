import CryptoJS from "crypto-js";

function sortAndStringifyParams(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((key) => `${key}${params[key]}`).join("");
}

function generateSignature({
  path,
  secretKey,
  nonce,
  timestamp,
  body,
  contentType = "application/json",
}: {
  path: string;
  secretKey: string;
  nonce: string;
  timestamp: string;
  body?: any;
  contentType?: string;
}) {
  // Params for signature
  const allParams = { nonce, timestamp };
  const paramsString = sortAndStringifyParams(allParams);

  let signingString = `${secretKey}${path}${paramsString}`;

  const isMultipart = (contentType || "").includes("multipart/form-data");
  if (
    !isMultipart &&
    body &&
    (typeof body !== "object" || Object.keys(body).length > 0)
  ) {
    signingString += typeof body === "string" ? body : JSON.stringify(body);
  }
  signingString += secretKey;

  const sign = CryptoJS.HmacSHA256(signingString, secretKey).toString(
    CryptoJS.enc.Hex
  );
  return sign;
}

// Example usage for the provided endpoint
const secretKey =
  "28fe1173c0144941a15c4e72c8c3a24af2ad9b611627803d5976181469c9ace4";
const path = "/api/v1/collections/plants/694f3f5b9f921b1dc00d6537";
const nonce = "dddf3920-f51f-451a-959a-ec58e070853f";
const timestamp = "1767954570";
const body = { name: "Snake plant" };

const sign = generateSignature({
  path,
  secretKey,
  nonce,
  timestamp,
  body,
  contentType: "application/json",
});

console.log("Signature:", sign);
console.log("Nonce:", nonce);
console.log("Timestamp:", timestamp);
console.log("Body:", JSON.stringify(body));
console.log(
  "Full URL:",
  `https://qr8qnr6z-8003.asse.devtunnels.ms${path}?nonce=${nonce}&timestamp=${timestamp}&sign=${sign}`
);
