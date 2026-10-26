import Fuse from "fuse.js";
import { useDeferredValue, useMemo } from "react";
import { filterByServerTypes, fuseOptions, groupByHost } from "./hosts.js";
import { useQueryParam } from "./useQueryParam.js";

const NO_SERVER_TYPES = [];

const serverTypeToggles = [
  { type: "qtv", label: "QTV" },
  { type: "proxy", label: "Proxy" },
];

// free text (?filter=) and server type filters for hosts
export const useHostFilters = (servers) => {
  const [query, setQuery] = useQueryParam("filter", "");
  const [serverTypes, setServerTypes] = useQueryParam(
    "types",
    NO_SERVER_TYPES,
    serverTypeToggles.map((t) => t.type),
  );
  const hosts = useMemo(() => groupByHost(servers), [servers]);
  const fuse = useMemo(() => new Fuse(hosts, fuseOptions), [hosts]);

  const toggleServerType = (type) =>
    setServerTypes(
      serverTypes.includes(type)
        ? serverTypes.filter((t) => t !== type)
        : [...serverTypes, type],
    );

  // keep typing responsive while the (expensive) results re-render
  const deferredQuery = useDeferredValue(query.trim());
  const searchedHosts = useMemo(
    () =>
      deferredQuery
        ? fuse.search(deferredQuery).map((result) => result.item)
        : hosts,
    [fuse, hosts, deferredQuery],
  );
  const visibleHosts = useMemo(
    () => filterByServerTypes(searchedHosts, serverTypes),
    [searchedHosts, serverTypes],
  );

  // servers of the visible hosts, in the original order (by hostname)
  const visibleServers = useMemo(() => {
    const included = new Set(visibleHosts.flatMap((host) => host.servers));
    return servers.filter((server) => included.has(server));
  }, [servers, visibleHosts]);

  return {
    hosts,
    visibleHosts,
    visibleServers,
    query,
    setQuery,
    serverTypes,
    toggleServerType,
  };
};

// top bar with the filters of useHostFilters,
// content before the filters (e.g. site name) and extra controls (children) can be passed
export const HostFilterBar = (props) => {
  const { filters } = props;

  return (
    <div className="z-10 flex flex-wrap items-center gap-3 bg-gray-800 px-2 py-3 text-sm text-white shadow">
      {props.before}
      <input
        className="input input-sm w-full max-w-md text-sm text-base-content"
        type="search"
        placeholder="Filter by ip, hostname, admin, location, software…"
        value={filters.query}
        onChange={(e) => filters.setQuery(e.target.value)}
      />
      {serverTypeToggles.map(({ type, label }) => (
        <label
          key={type}
          className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer select-none"
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm bg-white"
            checked={filters.serverTypes.includes(type)}
            onChange={() => filters.toggleServerType(type)}
          />
          {label}
        </label>
      ))}
      <span className="text-gray-400 whitespace-nowrap">
        {filters.visibleHosts.length} / {filters.hosts.length} hosts
      </span>
      {props.children}
    </div>
  );
};
