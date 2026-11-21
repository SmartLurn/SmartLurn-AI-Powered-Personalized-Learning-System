// TURN server credentials for video calls (Cloudflare Realtime TURN, 1,000 GB/month free).
// A TURN server relays the video when two devices can't connect directly
// (mobile data, strict Wi-Fi). Cloudflare gives short-lived credentials,
// so the secret API token stays here on the server and never reaches the browser.

const CREDENTIALS_VALID_SECONDS = 24 * 60 * 60; // 24 hours (a call won't last longer)

// GET /api/turn-credentials
export const getTurnCredentials = async (req, res) => {
  try {
    const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
    const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;

    // Not set up: the frontend falls back to its own TURN settings (or STUN only)
    if (!keyId || !apiToken) {
      return res.status(200).json({ iceServers: [] });
    }

    const response = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${keyId}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: CREDENTIALS_VALID_SECONDS }),
      }
    );

    if (!response.ok) {
      console.log('Cloudflare TURN error:', response.status, await response.text());
      return res.status(200).json({ iceServers: [] });
    }

    const data = await response.json();

    // Cloudflare may return one server object or a list of them
    const servers = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];

    // Browsers block port 53, so remove those URLs (they would only cause timeouts)
    const iceServers = servers
      .filter(Boolean)
      .map((server) => {
        const urls = (Array.isArray(server.urls) ? server.urls : [server.urls]).filter(
          (url) => !/:53(\?|$)/.test(url)
        );
        return { ...server, urls };
      })
      .filter((server) => server.urls.length > 0);

    return res.status(200).json({ iceServers });
  } catch (error) {
    console.log('TURN credentials error:', error);
    return res.status(200).json({ iceServers: [] });
  }
};
