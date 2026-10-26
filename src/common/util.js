const SERVERS_URL = "https://api.quake.world/v1/servers";
const IP_TO_GEO_URL =
  "https://raw.githubusercontent.com/vikpe/qw-servers-geoip/refs/heads/main/ip_to_geo.json";

const EMPTY_GEO = {
  cc: "",
  country: "",
  region: "",
  city: "",
  coordinates: null,
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }

  return response.json();
};

// "hostname:port" if the server hostname starts with one, else "ip:port"
function parseHostport(server) {
  const hostRe =
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+/;
  const name = (server.info.hostname || "").trim().toLowerCase().split(" ")[0];

  if (new RegExp(`${hostRe.source}:[0-9]+$`).test(name)) {
    return name;
  } else if (new RegExp(`${hostRe.source}$`).test(name)) {
    return `${name}:${server.port}`;
  }

  return server.address;
}

export function getServerDetails() {
  return Promise.all([
    fetchJson(SERVERS_URL),
    fetchJson(IP_TO_GEO_URL).catch(() => ({})),
  ]).then(([servers, ipToGeo]) => {
    const details = servers.map((server) => {
      const settings = { ...server.info };
      settings.hostname = (settings.hostname || "").trim();
      settings.hostname_parsed = parseHostport(server);

      const geo = { ...EMPTY_GEO, ...ipToGeo[server.ip] };

      try {
        if (settings.city) {
          geo.city = settings.city;
        }

        if (settings.coords) {
          geo.coordinates = settings.coords
            .trim()
            .split(",")
            .map((p) => Number.parseFloat(p));
        }
      } catch {}

      return {
        ...server,
        settings,
        version: settings["*version"] || "",
        geo,
      };
    });

    return details.sort((a, b) =>
      a.settings.hostname.localeCompare(b.settings.hostname, "en", {
        sensitivity: "base",
      }),
    );
  });
}
