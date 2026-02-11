exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const address = qs.address;
    if (!address) return { statusCode: 400, body: "Missing address" };

    const keyId = process.env.NCP_MAPS_CLIENT_ID;
    const key = process.env.NCP_MAPS_CLIENT_SECRET;
    if (!keyId || !key) {
      return { statusCode: 500, body: "Missing env: NCP_MAPS_CLIENT_ID / NCP_MAPS_CLIENT_SECRET" };
    }

    const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    const resp = await fetch(url, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
        "accept": "application/json",
      },
    });

    const text = await resp.text();
    const ct = resp.headers.get("content-type");
    const cl = resp.headers.get("content-length");

    // ✅ 여기: 0바디 방어 + 디버그
    if (!text || !text.trim()) {
      return {
        statusCode: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(
          {
            error: "EMPTY_BODY_FROM_NCP",
            status: resp.status,
            contentType: ct,
            contentLength: cl,
            url,
            hint: "대부분 키/시크릿이 잘못됐거나, 다른 앱 키(Geocoding 미연동)로 바뀐 경우입니다.",
          },
          null,
          2
        ),
      };
    }

    if (!resp.ok) {
      return { statusCode: resp.status, body: text };
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      return {
        statusCode: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(
          { error: "NON_JSON_FROM_NCP", status: resp.status, contentType: ct, bodyPreview: text.slice(0, 500) },
          null,
          2
        ),
      };
    }

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
        { status: "OK", input: address, lon: Number(first.x), lat: Number(first.y) },
        null,
        2
      ),
    };
  } catch (e) {
    return { statusCode: 500, body: `Server error: ${e?.message || String(e)}` };
  }
};
