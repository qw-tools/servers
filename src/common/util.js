import _sortBy from "lodash.sortby";

export function getServerDetails() {
  const SERVERS_DETAILS_URL = "https://hubapi.quakeworld.nu/v2/servers";

  return fetch(SERVERS_DETAILS_URL)
    .then((data) => data.json())
    .then((details) => {
      for (let i = 0; i < details.length; i++) {
        if (!details[i].settings.hasOwnProperty("hostname")) {
          details[i].settings.hostname = "";
        }
      }

      return _sortBy(details, (s) => s.settings.hostname.toLowerCase());
    });
}

export function getServerUsage() {
  const SERVERS_USAGE_URL =
    "https://raw.githubusercontent.com/vikpe/qw-data/main/hubapi/server_usage.json";

  return fetch(SERVERS_USAGE_URL).then((data) => data.json());
}
