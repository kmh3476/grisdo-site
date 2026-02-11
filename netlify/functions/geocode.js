exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const address = qs.address;
    if (!address) return { statusCode: 400, body: "Missing address" };

    const keyId = process.env.NCP_MAPS_CLIENT_ID;
    const key = process.env.NCP_MAPS_CLIENT_SECRET;
    if (!keyId || !key) return { statusCode: 500, body: "Missing NCP credentials" };

    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
    const resp = await fetch(url, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
        "accept": "application/json",
      },
    });

    const text = await resp.text();
    if (!resp.ok) return { statusCode: resp.status, body: text };

    const json = JSON.parse(text);
    const first = json.addresses?.[0];
    if (!first) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify({ status: "NO_RESULT", input: address }, null, 2),
      };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(
        {
          status: "OK",
          input: address,
          lon: Number(first.x), // 경도
          lat: Number(first.y), // 위도
        },
        null,
        2
      ),
    };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e?.message || String(e)}` };
  }
};
