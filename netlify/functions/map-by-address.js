exports.handler = async (event) => {
  const qs = event.queryStringParameters || {};
  const address = qs.address;
  const w = qs.w || "800";
  const h = qs.h || "450";
  const level = qs.level || "16";

  const keyId = process.env.NCP_MAPS_CLIENT_ID;
  const key = process.env.NCP_MAPS_CLIENT_SECRET;

  const fail = (step, extra) => ({
    statusCode: 502,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ step, ...extra }, null, 2),
  });

  try {
    if (!address) return fail("input", { message: "Missing address" });
    if (!keyId || !key) return fail("env", { message: "Missing NCP credentials" });

    // 1) Geocode (여긴 네가 방금 성공한 그 도메인 그대로)
    const geocodeUrl =
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    let gResp, gText, gJson;
    try {
      gResp = await fetch(geocodeUrl, {
        headers: {
          "x-ncp-apigw-api-key-id": keyId,
          "x-ncp-apigw-api-key": key,
          "accept": "application/json",
        },
      });
      gText = await gResp.text();
    } catch (e) {
      return fail("geocode_fetch_failed", { url: geocodeUrl, message: e?.message || String(e) });
    }

    if (!gResp.ok) {
      return fail("geocode_http_error", { status: gResp.status, body: gText.slice(0, 500) });
    }

    try {
      gJson = JSON.parse(gText);
    } catch (e) {
      return fail("geocode_json_parse_failed", { bodyPreview: gText.slice(0, 500) });
    }

    const first = gJson.addresses?.[0];
    if (!first) return fail("geocode_no_result", { address });

    const lon = first.x; // 경도
    const lat = first.y; // 위도

    // 2) Static Map (✅ 반드시 maps.apigw.ntruss.com)
    const center = `${lon},${lat}`;
    const markerPos = `${lon} ${lat}`;

    const mapUrl =
      `https://maps.apigw.ntruss.com/map-static/v2/raster` +
      `?w=${encodeURIComponent(w)}` +
      `&h=${encodeURIComponent(h)}` +
      `&center=${encodeURIComponent(center)}` +
      `&level=${encodeURIComponent(level)}` +
      `&markers=${encodeURIComponent(`type:d|size:mid|pos:${markerPos}`)}`;

    let mResp;
    try {
      mResp = await fetch(mapUrl, {
        headers: {
          "x-ncp-apigw-api-key-id": keyId,
          "x-ncp-apigw-api-key": key,
          "accept": "image/png,image/*;q=0.8,*/*;q=0.5",
        },
      });
    } catch (e) {
      return fail("staticmap_fetch_failed", { url: mapUrl, message: e?.message || String(e) });
    }

    if (!mResp.ok) {
      const t = await mResp.text();
      return fail("staticmap_http_error", { status: mResp.status, body: t.slice(0, 500) });
    }

    const buf = Buffer.from(await mResp.arrayBuffer());

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": mResp.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400",
      },
      body: buf.toString("base64"),
    };
  } catch (e) {
    return fail("unknown_error", { message: e?.message || String(e) });
  }
};
