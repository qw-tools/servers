import _sortBy from "lodash.sortby";

export function getServerDetails() {
  const SERVERS_DETAILS_URL = "https://hubapi.quakeworld.nu/v2/servers";

  return fetch(SERVERS_DETAILS_URL)
    .then((data) => data.json())
    .then((details) => {
      for (let i = 0; i < details.length; i++) {
        const settings = details[i].settings;

        if (!settings.hasOwnProperty("hostname")) {
          settings.hostname = "";
        }

        if (settings.city) {
          details[i].geo.city = settings.city;
        }

        if (settings.coords) {
          details[i].geo.coords = settings.coords.trim().split(",").map(p => Number.parseFloat(p));
        }
      }

      return _sortBy(details, (s) => s.settings.hostname.toLowerCase());
    });
}
