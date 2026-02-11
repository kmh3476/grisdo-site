// netlify/functions/map-by-address.js
// CommonJS Netlify Function (가장 호환 잘 됨)

exports.handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const address = qs.address;
    if (!address) {
      return { statusCode: 400, body: "Missing address" };
    }

    const w = qs.w || "800";
    const h = qs.h || "450";
    const level = qs.level || "16";

    const keyId = process.env.NCP_MAPS_CLIENT_ID;
    const key = process.env.NCP_MAPS_CLIENT_SECRET;

    if (!keyId || !key) {
      return { statusCode: 500, body: "Missing NCP credentials (env vars)" };
    }

    // 1) Geocode: 주소 -> x(경도), y(위도)
    const geocodeUrl =
      `https://naveropenapi.apigw-pub.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    const gResp = await fetch(geocodeUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
      },
    });

    const gText = await gResp.text();

// 디버그: 지오코딩 응답이 비거나 JSON이 아닐 때 그대로 보여주기
if (!gText || !gText.trim()) {
  return {
    statusCode: 502,
    body: `Geocode empty body
status=${gResp.status}
content-type=${gResp.headers.get("content-type")}
address=${address}`,
  };
}

if (!gResp.ok) {
  return { statusCode: gResp.status, body: gText };
}

let gJson;
try {
  gJson = JSON.parse(gText);
} catch (e) {
  return {
    statusCode: 502,
    body: `Geocode non-JSON response
status=${gResp.status}
content-type=${gResp.headers.get("content-type")}
body=${gText.slice(0, 300)}`,
  };
}

    const first = gJson.addresses && gJson.addresses[0];
    if (!first) {
      return { statusCode: 404, body: `No geocode result for: ${address}` };
    }

    const lon = first.x; // 경도
    const lat = first.y; // 위도

    // 2) Static Map (이미지)
    const center = `${lon},${lat}`;
    const markerPos = `${lon} ${lat}`;

    const mapUrl =
      `https://maps.apigw.ntruss.com/map-static/v2/raster` +
      `?w=${encodeURIComponent(w)}` +
      `&h=${encodeURIComponent(h)}` +
      `&center=${encodeURIComponent(center)}` +
      `&level=${encodeURIComponent(level)}` +
      `&markers=${encodeURIComponent(`type:d|size:mid|pos:${markerPos}`)}`;

    const mResp = await fetch(mapUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
      },
    });

    if (!mResp.ok) {
      const t = await mResp.text();
      return { statusCode: mResp.status, body: t };
    }

    // Netlify Functions는 바이너리 반환 시 base64 필요
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
    // 에러 메시지를 응답으로 내보내면 원인 잡기 쉬움
    return { statusCode: 500, body: `Server error: ${e && e.message ? e.message : String(e)}` };
  }
};
