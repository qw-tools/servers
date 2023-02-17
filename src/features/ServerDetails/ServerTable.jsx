import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import _pick from "lodash.pick";
import _sortBy from "lodash.sortby";

const SERVERS_DETAILS_URL = "https://hubapi.quakeworld.nu/v2/servers";

const defaultOptions = {
  filter: true,
  floatingFilter: true,
  suppressMenu: true,
  resizable: true,
  sortable: true,
};

const columnDefs = [
  {
    field: "hostname",
    width: 260,
    cellRenderer: (params) => (
      <span title={params.value}>
        <img
          src={`https://www.quakeworld.nu/images/flags/${params.data.cc.toLowerCase()}.gif`}
          className={"inline"}
          width={16}
          height={11}
          alt=""
        />{" "}
        {params.value}
      </span>
    ),
  },
  { field: "address" },
  { field: "admin" },
  { field: "version" },
  { field: "ktxver" },
  { field: "gamedir", width: 140, headerName: "gamedir" },
  { field: "sv_antilag", width: 100, headerName: "sv_antilag" },
  { field: "region", width: 170 },
  { field: "country", width: 160 },
  { field: "city", width: 180 },
].map((d) => ({ ...d, ...defaultOptions }));

const gridOptions = {
  enableCellTextSelection: true,
  ensureDomOrder: true,
};

export const ServerTable = () => {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetch(SERVERS_DETAILS_URL)
      .then((data) => data.json())
      .then((details) =>
        setDetails(_sortBy(details, (s) => s.settings.hostname.toLowerCase()))
      );
  }, []);

  const flatDetails = toFlatData(details);

  return (
    <div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        gridOptions={gridOptions}
        rowData={flatDetails}
        columnDefs={columnDefs}
        onGridReady={applyQueryParams}
      ></AgGridReact>
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
      gamedir: settings["*gamedir"],
      ..._pick(settings, ["ktxver", "sv_antilag"]),
      ...geo,
    });
  }

  return result;
};

const applyQueryParams = (event) => {
  if (0 === window.location.search.length) {
    return;
  }

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  const fieldNames = event.api.columnModel.columnDefs.map((d) => d.field);
  let hasChangedFilters = false;

  fieldNames.forEach((key) => {
    if (params[key]) {
      const filterInstance = event.api.getFilterInstance(key);
      filterInstance.setModel({
        type: "text",
        filter: params[key],
      });
      hasChangedFilters = true;
    }
  });

  if (hasChangedFilters) {
    event.api.onFilterChanged();
  }
};
