export default async (req) => {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    if (!address) return new Response("Missing address", { status: 400 });

    const w = url.searchParams.get("w") || "800";
    const h = url.searchParams.get("h") || "450";
    const level = url.searchParams.get("level") || "16";

    const keyId = process.env.NCP_MAPS_CLIENT_ID;
    const key = process.env.NCP_MAPS_CLIENT_SECRET;
    if (!keyId || !key) return new Response("Missing NCP credentials", { status: 500 });

    // 1) Geocoding (주소 -> x(경도), y(위도))
    const geocodeUrl =
      `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

    const g = await fetch(geocodeUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
      },
    });

    const gText = await g.text();
    if (!g.ok) return new Response(gText, { status: g.status });

    const gJson = JSON.parse(gText);
    const first = gJson.addresses?.[0];
    if (!first) return new Response("No geocode result", { status: 404 });

    const lon = first.x; // 경도
    const lat = first.y; // 위도

    // 2) Static Map 이미지
    const center = `${lon},${lat}`;
    const markerPos = `${lon} ${lat}`;

    const mapUrl =
      `https://maps.apigw.ntruss.com/map-static/v2/raster` +
      `?w=${encodeURIComponent(w)}` +
      `&h=${encodeURIComponent(h)}` +
      `&center=${encodeURIComponent(center)}` +
      `&level=${encodeURIComponent(level)}` +
      `&markers=${encodeURIComponent(`type:d|size:mid|pos:${markerPos}`)}`;

    const m = await fetch(mapUrl, {
      headers: {
        "x-ncp-apigw-api-key-id": keyId,
        "x-ncp-apigw-api-key": key,
      },
    });

    if (!m.ok) {
      const t = await m.text();
      return new Response(t, { status: m.status });
    }

    const buf = await m.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": m.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
};
