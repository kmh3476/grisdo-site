exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const address = qs.address;
    if (!address) return { statusCode: 400, body: "Missing address" };

    const keyId = process.env.NCP_MAPS_CLIENT_ID;
    const key = process.env.NCP_MAPS_CLIENT_SECRET;
    if (!keyId || !key) return { statusCode: 500, body: "Missing NCP credentials" };

    const geocodeUrl =
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    const resp = await fetch(geocodeUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
        "accept": "application/json",
      },
    });

    const text = await resp.text();

    return {
      statusCode: resp.status,
      headers: { "content-type": resp.headers.get("content-type") || "text/plain; charset=utf-8" },
      body: text || "(empty body)",
    };
  } catch (e) {
    return { statusCode: 500, body: `fetch failed: ${e && e.message ? e.message : String(e)}` };
  }
};
