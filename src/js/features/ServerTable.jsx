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
  { field: 'ktxver' },
  { field: '*gamedir', width: 140, },
  { field: 'sv_antilag', width: 100, },
  { field: 'region', width: 170, },
  {
    field: 'country', width: 160, cellRenderer: (params) => {
      return (
        <span>
          <img src={`https://www.quakeworld.nu/images/flags/${(params.data.cc.toLowerCase())}.gif`} width={16}
               height={11} />
          {' '}{params.value}
        </span>
      );
    },
  },
  { field: 'city', width: 180 },
].map(d => ({ ...d, ...defaultOptions }));

const gridOptions = {
  enableCellTextSelection: true,
  ensureDomOrder: true,
};

export const ServerTable = () => {
  const servers = useSelector(selectAllServers);
  const flatData = toFlatData(servers);

  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        gridOptions={gridOptions}
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
      ..._pick(settings, ["*gamedir", "ktxver", "sv_antilag", "maxclients", "maxspectators"]),
      ...geo,
    });
  }

  return result;
};
