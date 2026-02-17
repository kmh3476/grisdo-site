export async function handler() {
  const accessToken = process.env.BAND_ACCESS_TOKEN;

  const url = new URL("https://openapi.band.us/v2/bands");
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("locale", "ko_KR");

  const resp = await fetch(url.toString());
  const data = await resp.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data, null, 2),
  };
}
