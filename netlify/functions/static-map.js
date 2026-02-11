// netlify/functions/static-map.js
export default async (req) => {
  try {
    const url = new URL(req.url);

    // 기본값 (원하면 쿼리로 조절 가능)
    const w = url.searchParams.get("w") || "800";
    const h = url.searchParams.get("h") || "450";
    const level = url.searchParams.get("level") || "16";

    // 네 좌표: center는 "경도,위도"
    const center = url.searchParams.get("center") || "128.539009627304,35.8481402324648";
    const markerPos = url.searchParams.get("pos") || "128.539009627304 35.8481402324648";

    // 네이버 Static Map (서버용 raster)
    const naverUrl =
      `https://naveropenapi.apigw-pub.fin-ntruss.com/map-static/v2/raster` +
      `?w=${encodeURIComponent(w)}` +
      `&h=${encodeURIComponent(h)}` +
      `&center=${encodeURIComponent(center)}` +
      `&level=${encodeURIComponent(level)}` +
      `&markers=${encodeURIComponent(`type:d|size:mid|pos:${markerPos}`)}`;

    const clientId = process.env.NCP_MAPS_CLIENT_ID;
    const clientSecret = process.env.NCP_MAPS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new Response("Missing NCP credentials", { status: 500 });
    }

    const resp = await fetch(naverUrl, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(text, { status: resp.status });
    }

    // 이미지 바이너리를 그대로 전달
    const buf = await resp.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": resp.headers.get("content-type") || "image/png",
        // 캐시(원하면 조절)
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new Response("Server error", { status: 500 });
  }
};
