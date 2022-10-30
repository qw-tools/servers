import React from "react";
import { useSelector } from "react-redux";
import { selectAllServers } from "../services/hub.js";
import { AgGridReact } from 'ag-grid-react';
import _pick from "lodash.pick";

const defaultOptions = {
  filter: true,
  floatingFilter: true,
  suppressMenu: true,
  resizable: true,
  sortable: true,
}

const columnDefs = [
  { field: 'hostname' },
  { field: 'address' },
  { field: 'admin' },
  { field: 'version' },
  { field: 'gamedir' },
  { field: 'ktxver' },
  { field: 'mode' },
  { field: 'antilag' },
  { field: 'region' },
  { field: 'country' },
  { field: 'city' },
].map(d => ({ ...d, ...defaultOptions }));

export const ServerTable = () => {
  const servers = useSelector(selectAllServers);
  const flatData = toFlatData(servers);

  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        rowData={flatData}
        columnDefs={columnDefs}>
      </AgGridReact>
    </div>
  );
};

const toFlatData = (servers) => {
  const result = [];

  for (let i = 0; i < servers.length; i++) {
    const { address, version, settings, geo } = servers[i];
    result.push({
      hostname: settings["hostname"],
      address,
      admin: settings["*admin"],
      version,
      ..._pick(settings, ["*gamedir", "ktxver", "mode", "sv_antilag", "maxclients", "maxspectators"]),
      ..._pick(geo, ["region", "country", "city"]),
    });
  }

  console.log(result[0]);

  return result;
};
