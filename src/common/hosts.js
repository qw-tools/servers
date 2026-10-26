// hosts: servers grouped by ip, with a derived title, admin and geo

// keep only servers of the checked types, and hosts that have any of them
export const filterByServerTypes = (hosts, serverTypes) => {
  if (serverTypes.length === 0) {
    return hosts;
  }

  return hosts
    .map((host) => ({
      ...host,
      servers: host.servers.filter((s) => serverTypes.includes(s.server_type)),
    }))
    .filter((host) => host.servers.length > 0);
};

export const fuseOptions = {
  threshold: 0.3,
  ignoreLocation: true,
  ignoreDiacritics: true,
  keys: [
    "ip",
    "title",
    "admin",
    "geo.city",
    "geo.country",
    "geo.region",
    {
      name: "hostname",
      getFn: (h) => h.servers.map((s) => s.settings.hostname),
    },
    { name: "address", getFn: (h) => h.servers.map(serverAddress) },
    { name: "software", getFn: (h) => h.servers.map((s) => s.software_type) },
  ],
};

// "oddjob <oddjob@example.com>" -> "oddjob"
const adminName = (admin = "") =>
  admin
    .replace(/<[^>]*>|\([^)]*\)/g, "")
    .replace(/\S+(@|\[at\])\S+\.\S+/g, "")
    .trim();

export const serverAddress = (server) =>
  server.settings.hostport || server.settings.hostname_parsed;

const SERVER_TYPE_ORDER = ["qtv", "proxy", "game"];

const serverTypeRank = (server) => {
  const index = SERVER_TYPE_ORDER.indexOf(server.server_type);
  return index === -1 ? SERVER_TYPE_ORDER.length : index;
};

const longestCommonPrefix = (strings) =>
  strings.reduce((prefix, s) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === s[i]) i++;
    return prefix.slice(0, i);
  }, strings[0] ?? "");

const isWordChar = (char = "") => /[\p{L}\p{N}]/u.test(char);

// "qw.example.com:28501 #1" -> "qw.example.com #1"
const stripPort = (hostname) =>
  hostname
    .replace(/:\d{2,5}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

// common start of strings, without partial words or trailing separators
const commonStart = (strings, trailingSeparators) => {
  let prefix = longestCommonPrefix(strings);

  const endsMidWord =
    isWordChar(prefix.at(-1)) &&
    strings.some((s) => isWordChar(s[prefix.length]));

  if (endsMidWord) {
    prefix = prefix.replace(/[\p{L}\p{N}]+$/u, "");
  }

  return prefix.replace(trailingSeparators, "");
};

const reverse = (s) => [...s].reverse().join("");

const MIN_TITLE_LENGTH = 3;

// longest common prefix of hostnames, else longest common suffix, e.g.
// "Berlin KTX Server" from "Berlin KTX Server #1" and "Berlin KTX Server #2"
// "nicotinelounge.com" from "FFA @ nicotinelounge.com" and "CTF @ nicotinelounge.com"
const commonTitle = (hostnames) => {
  hostnames = hostnames.map(stripPort);

  const prefix = commonStart(hostnames, /[\s\-_:|#<([{.,/=*'@]+$/u);

  if (prefix.length >= MIN_TITLE_LENGTH) {
    return prefix;
  }

  const suffix = reverse(
    commonStart(hostnames.map(reverse), /[\s\-_:|#>)\]}.,/=*'@]+$/u),
  );

  return suffix.length >= MIN_TITLE_LENGTH ? suffix : null;
};

// prefer hostports set in serverinfo, fall back to game server hostnames
const hostTitle = (servers) => {
  const hostports = servers.map((s) => s.settings.hostport).filter(Boolean);
  const hostnames = servers
    .filter((s) => s.server_type === "game")
    .map((s) => s.settings.hostname);

  return (
    (hostports.length > 0 && commonTitle(hostports)) || commonTitle(hostnames)
  );
};

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

// sort by title ignoring leading decoration, e.g. "-= Impactoria" as "Impactoria"
const titleSortKey = (host) =>
  (host.title ?? host.ip).replace(/^[^\p{L}\p{N}]+/u, "");

// one entry per ip, sorted by title (a-z, untitled last by ip), servers sorted by type then port
export const groupByHost = (servers) => {
  const hosts = Map.groupBy(servers, (s) => s.ip);

  return [...hosts]
    .map(([ip, hostServers]) => ({
      ip,
      title: hostTitle(hostServers),
      admin: hostServers
        .map((s) => adminName(s.settings["*admin"]))
        .find(Boolean),
      geo: hostServers[0].geo,
      servers: hostServers.toSorted(
        (a, b) => serverTypeRank(a) - serverTypeRank(b) || a.port - b.port,
      ),
    }))
    .sort(
      (a, b) =>
        !a.title - !b.title ||
        collator.compare(titleSortKey(a), titleSortKey(b)),
    );
};

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryName = (geo) => {
  try {
    return countryNames.of(geo.cc);
  } catch {
    return geo.country;
  }
};

export const groupings = [
  { value: "none", label: "None" },
  {
    value: "region",
    label: "Region",
    getKey: (host) => host.geo.region,
    // by country code, since country names vary (e.g. "Netherlands" and "The Netherlands")
    getSubKey: (host) => host.geo.cc,
    getSubName: (hosts) => countryName(hosts[0].geo),
  },
  { value: "admin", label: "Admin", getKey: (host) => host.admin },
];

export const groupingLabel = (grouping) =>
  `${groupings.find((g) => g.value === grouping).label}s`;

const UNKNOWN_GROUP = "Unknown";

// groups sorted by name, "Unknown" last; host order is kept within each group
const toSortedGroups = (hosts, getKey, getName = () => null) =>
  [...Map.groupBy(hosts, (host) => getKey(host) || UNKNOWN_GROUP)]
    .map(([key, hosts]) => ({
      name: (key !== UNKNOWN_GROUP && getName(hosts)) || key,
      hosts,
      cc: hosts[0].geo.cc,
    }))
    .sort(
      (a, b) =>
        (a.name === UNKNOWN_GROUP) - (b.name === UNKNOWN_GROUP) ||
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
    );

export const groupHosts = (hosts, grouping) => {
  const { getKey, getSubKey, getSubName } = groupings.find(
    (g) => g.value === grouping,
  );

  if (!getKey) {
    return [{ name: null, hosts }];
  }

  return toSortedGroups(hosts, getKey).map((group) => ({
    name: group.name,
    hosts: group.hosts,
    subgroups: getSubKey && toSortedGroups(group.hosts, getSubKey, getSubName),
  }));
};
