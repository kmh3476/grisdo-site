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

    // 바디를 text로 한 번, 길이도 같이 확인
    const text = await resp.text();

    const debug = {
      url,
      status: resp.status,
      ok: resp.ok,
      contentType: resp.headers.get("content-type"),
      contentLength: resp.headers.get("content-length"),
      server: resp.headers.get("server"),
      date: resp.headers.get("date"),
      // 일부 요청은 request id 헤더가 붙어오기도 함
      requestId: resp.headers.get("x-ncp-apigw-request-id") || resp.headers.get("x-request-id"),
      bodyLength: text.length,
      bodyPreview: text.slice(0, 500),
    };

    return {
      statusCode: 200, // 디버그는 항상 200으로 내려서 브라우저에서 잘 보이게
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(debug, null, 2),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ error: "fetch failed", message: e?.message || String(e) }, null, 2),
    };
  }
};
