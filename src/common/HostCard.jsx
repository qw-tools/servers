import React from "react";
import { serverAddress } from "./hosts.js";
import { CopyText, Flag } from "./UserInterface.jsx";

export const HostCard = React.memo((props) => {
  const { ip, title, admin, geo, servers } = props.host;
  const gameServers = servers.filter((s) => s.server_type === "game");
  const otherServers = servers.filter((s) => s.server_type !== "game");
  const location = [geo.city, geo.country].filter(Boolean).join(", ");
  const details = [location, admin && `admin: ${admin}`]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="card mb-4 break-inside-avoid overflow-hidden bg-base-100 shadow-sm text-sm">
      <div className="px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          {geo.cc && <Flag cc={geo.cc} />}
          {title ? (
            <>
              <span className="font-bold truncate" title={title}>
                {title}
              </span>
              <CopyText
                text={ip}
                className="ml-auto shrink-0 font-mono text-xs text-gray-600"
              />
            </>
          ) : (
            <CopyText text={ip} className="font-mono font-bold" />
          )}
        </div>
        {details && (
          <div className="text-xs text-gray-500 truncate">{details}</div>
        )}
      </div>
      {otherServers.length > 0 && (
        <div className="divide-y border-b">
          {otherServers.map((server) => (
            <HostServer key={server.address} server={server} showLabel />
          ))}
        </div>
      )}
      {[...Map.groupBy(gameServers, (s) => s.software_type)].map(
        ([softwareType, typeServers]) => (
          <div key={softwareType} className="not-first:border-t">
            <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-xs text-gray-500">
              <SoftwareLabel softwareType={softwareType} />
              {`(${typeServers.length})`}
            </div>
            <div className="divide-y">
              {typeServers.map((server) => (
                <HostServer key={server.address} server={server} />
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
});

const softwareTypeBadges = {
  fte: "badge-warning",
  fortressone: "badge-error",
  z_quake: "badge-success",
  qtv: "badge-primary",
  qwfwd: "badge-info",
  proxy: "badge-info",
};

// mvdsv is the most common software, shown in bold instead of a badge
const SoftwareLabel = (props) =>
  props.softwareType === "mvdsv" ? (
    <span className="text-xs font-bold text-gray-700">
      {props.softwareType}
    </span>
  ) : (
    <span
      className={`badge badge-soft badge-sm ${
        softwareTypeBadges[props.softwareType] ?? "badge-neutral"
      }`}
    >
      {props.softwareType}
    </span>
  );

// qtv/proxy servers are listed with a server type label, game servers under a heading per software type
const HostServer = (props) => {
  const { settings, server_type } = props.server;
  const address = serverAddress(props.server);

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-yellow-50">
      <span className="flex min-w-0 grow items-center gap-1.5">
        <span className="truncate" title={settings.hostname}>
          {settings.hostname}
        </span>
        {props.showLabel && (
          <span className="shrink-0">
            <SoftwareLabel softwareType={server_type} />
          </span>
        )}
      </span>
      <CopyText
        text={address}
        className="shrink-0 font-mono text-gray-600 text-xs"
      />
    </div>
  );
};
