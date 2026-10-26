import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { HostCard } from "../../common/HostCard.jsx";
import { HostFilterBar, useHostFilters } from "../../common/HostFilters.jsx";
import { groupHosts, groupingLabel, groupings } from "../../common/hosts.js";
import { ButtonGroup, Flag } from "../../common/UserInterface.jsx";
import { getServerDetails } from "../../common/util.js";
import { SiteBrand } from "../../Site/SiteBrand.jsx";

// heavy views (ag-grid, mapbox) are only loaded when shown
const ServerTable = lazy(() =>
  import("./ServerTable.jsx").then((m) => ({ default: m.ServerTable })),
);
const ServerMap = lazy(() =>
  import("./ServerMap.jsx").then((m) => ({ default: m.ServerMap })),
);

import { useQueryParam } from "../../common/useQueryParam.js";

export const Servers = () => {
  const [servers, setServers] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    getServerDetails()
      .then((details) => {
        setServers(details);
        setStatus("ready");
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, []);

  const filters = useHostFilters(servers);
  const { visibleHosts } = filters;
  const [view, setView] = useQueryParam(
    "view",
    "table",
    views.map((v) => v.value),
  );
  const [grouping, setGrouping] = useQueryParam(
    "group",
    "none",
    groupings.map((g) => g.value),
  );

  const groups = useMemo(
    () => groupHosts(visibleHosts, grouping),
    [visibleHosts, grouping],
  );

  return (
    <div className="flex h-full flex-col">
      <HostFilterBar filters={filters} before={<SiteBrand />}>
        <div className="flex items-center gap-2 ml-6 pl-6 border-l border-gray-600 whitespace-nowrap">
          <ButtonGroup
            name="view"
            label="View"
            options={views}
            value={view}
            onChange={setView}
          />
        </div>
        {view === "cards" && (
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="text-gray-400">Group by:</span>
            <ButtonGroup
              name="grouping"
              label="Group by"
              options={groupings}
              value={grouping}
              onChange={setGrouping}
            />
          </div>
        )}
      </HostFilterBar>
      {status !== "ready" ? (
        <LoadingStatus status={status} />
      ) : view !== "cards" ? (
        <div className="min-h-0 grow">
          <Suspense fallback={<span className="loading loading-spinner m-4" />}>
            {view === "table" ? (
              <ServerTable servers={filters.visibleServers} />
            ) : (
              <ServerMap
                hosts={filters.visibleHosts}
                isSearching={filters.query.trim() !== ""}
              />
            )}
          </Suspense>
        </div>
      ) : (
        <div className="flex min-h-0 grow">
          {grouping !== "none" && (
            <GroupSidebar
              key={grouping}
              groups={groups}
              label={groupingLabel(grouping)}
              isFilterable={grouping === "admin"}
            />
          )}
          <main className="min-w-0 grow overflow-auto divide-y divide-gray-300">
            {groups.map(({ name, hosts, subgroups }, index) => (
              <section key={name ?? ""} id={groupId(index)}>
                {name && (
                  <h2 className="px-4 pt-4 text-lg font-bold">
                    {name}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      ({hosts.length})
                    </span>
                  </h2>
                )}
                {subgroups ? (
                  subgroups.map((subgroup, subIndex) => (
                    <section key={subgroup.name} id={groupId(index, subIndex)}>
                      <h3 className="flex items-center gap-2 px-4 pt-3 font-bold">
                        {subgroup.cc && <Flag cc={subgroup.cc} />}
                        {subgroup.name}
                        <span className="text-sm font-normal text-gray-500">
                          ({subgroup.hosts.length})
                        </span>
                      </h3>
                      <HostColumns hosts={subgroup.hosts} />
                    </section>
                  ))
                ) : (
                  <HostColumns hosts={hosts} />
                )}
              </section>
            ))}
          </main>
        </div>
      )}
    </div>
  );
};

const LoadingStatus = (props) =>
  props.status === "error" ? (
    <div role="alert" className="alert alert-error alert-soft m-4">
      Could not load servers, please try again later.
    </div>
  ) : (
    <span className="loading loading-spinner m-4" />
  );

const views = [
  { value: "table", label: "Table" },
  { value: "map", label: "World Map" },
  { value: "cards", label: "Host Cards" },
];

const HostColumns = (props) => (
  <div className="columns-[22rem] gap-4 p-4">
    {props.hosts.map((host) => (
      <HostCard key={host.ip} host={host} />
    ))}
  </div>
);

const groupId = (...indexes) => `group-${indexes.join("-")}`;

const matches = (name, needle) => name.toLowerCase().includes(needle);

// groups a-z in a sidebar (optionally filterable), with nested subgroups (e.g. region > country)
const GroupSidebar = (props) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  return (
    <nav
      aria-label={props.label}
      className="flex w-60 shrink-0 flex-col border-r bg-base-100 text-sm"
    >
      {props.isFilterable && (
        <div className="border-b p-2">
          <input
            className="input input-sm w-full"
            type="search"
            placeholder={`Filter ${props.label.toLowerCase()}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <div className="min-h-0 grow overflow-auto [scrollbar-width:thin]">
        <ul className="menu menu-sm w-full">
          {props.groups.map(({ name, hosts, subgroups }, index) => {
            const isMatch = matches(name, needle);
            const visibleSubgroups = (subgroups ?? []).filter(
              (subgroup) => isMatch || matches(subgroup.name, needle),
            );

            if (!isMatch && visibleSubgroups.length === 0) {
              return null;
            }

            return (
              <li key={name}>
                <GroupLink
                  href={`#${groupId(index)}`}
                  name={name}
                  count={hosts.length}
                  className={subgroups ? "font-bold" : ""}
                />
                {visibleSubgroups.length > 0 && (
                  <ul>
                    {subgroups.map(
                      (subgroup, subIndex) =>
                        visibleSubgroups.includes(subgroup) && (
                          <li key={subgroup.name}>
                            <GroupLink
                              href={`#${groupId(index, subIndex)}`}
                              name={subgroup.name}
                              count={subgroup.hosts.length}
                              cc={subgroup.cc}
                            />
                          </li>
                        ),
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

const GroupLink = (props) => (
  <a href={props.href} title={props.name} className={props.className}>
    {props.cc && <Flag cc={props.cc} />}
    <span className="truncate">{props.name}</span>
    <span className="ml-auto font-normal text-gray-500">{props.count}</span>
  </a>
);
