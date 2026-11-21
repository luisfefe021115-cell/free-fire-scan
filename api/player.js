
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

  const uid = String(req.query.uid || "");
  const region = String(req.query.region || "").toUpperCase();

  if (!/^\d{5,15}$/.test(uid)) {
    return res.status(400).json({
      error: "UID inválido. Use de 5 a 15 números."
    });
  }

  const allowed = [
    "BR", "SAC", "IND", "SG", "ID", "TH", "VN",
    "TW", "US", "NA", "RU", "ME", "PK", "CIS",
    "EUROPE", "BD"
  ];

  if (region && !allowed.includes(region)) {
    return res.status(400).json({
      error: "Região não reconhecida."
    });
  }

  const base = "https://api2.nftoken.info";

  const url = region
    ? `${base}/get?uid=${encodeURIComponent(uid)}&region=${encodeURIComponent(region)}`
    : `${base}/player-info?uid=${encodeURIComponent(uid)}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "FreeFireScan/1.0"
      }
    });

    const raw = await upstream.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!upstream.ok || !data || data.error) {
      return res.status(
        upstream.status >= 400 && upstream.status < 600
          ? upstream.status
          : 502
      ).json({
        error: data?.error ||
          `A API gratuita respondeu com status ${upstream.status || "inválido"}.`
      });
    }

    return res.status(200).json({ data });

  } catch {
    return res.status(502).json({
      error: "Não foi possível alcançar a API gratuita agora."
    });
  }
    }
        
