import {
  AllCommunityModule,
  ModuleRegistry,
  themeAlpine,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";
import { flagUrl } from "../../common/UserInterface.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const theme = themeAlpine.withParams({
  fontFamily: "inherit",
  rowHeight: 36,
  oddRowBackgroundColor: { ref: "foregroundColor", mix: 0.04 },
});

const defaultOptions = {
  filter: true,
  floatingFilter: true,
  suppressHeaderMenuButton: true,
  resizable: true,
  sortable: true,
};

// plain DOM renderer (no React component per cell) to keep scrolling fast
class HostnameCellRenderer {
  init(params) {
    this.eGui = document.createElement("span");
    this.eGui.title = params.value;

    if (params.data.cc) {
      const flag = document.createElement("img");
      flag.src = flagUrl(params.data.cc);
      flag.alt = params.data.cc;
      flag.className = "inline h-3 w-auto align-baseline mr-1";
      this.eGui.append(flag);
    }

    this.eGui.append(params.value);
  }

  getGui() {
    return this.eGui;
  }

  refresh() {
    return false;
  }
}

// plain DOM version of <CopyText>: click to copy, green "Copied!" for 1s
class CopyTextCellRenderer {
  init(params) {
    this.eGui = document.createElement("button");
    this.eGui.type = "button";
    this.eGui.className = "cursor-pointer rounded hover:bg-black/5";
    this.eGui.title = "Copy to clipboard";
    this.eGui.textContent = params.value;
    this.eGui.addEventListener("click", () =>
      navigator.clipboard.writeText(params.value).then(() => this.setCopied()),
    );
  }

  setCopied() {
    this.eGui.classList.add("text-green-600");
    this.eGui.title = "Copied!";

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.eGui.classList.remove("text-green-600");
      this.eGui.title = "Copy to clipboard";
    }, 1000);
  }

  getGui() {
    return this.eGui;
  }

  refresh() {
    return false;
  }

  destroy() {
    clearTimeout(this.timeout);
  }
}

const columnDefs = [
  {
    field: "hostname",
    width: 260,
    cellRenderer: HostnameCellRenderer,
  },
  {
    field: "address",
    cellRenderer: CopyTextCellRenderer,
  },
  { field: "admin" },
  { field: "version" },
  { field: "ktxver" },
  { field: "gamedir", width: 140, headerName: "gamedir" },
  { field: "sv_antilag", width: 100, headerName: "sv_antilag" },
  { field: "region", width: 170 },
  { field: "country", width: 160 },
  { field: "city", width: 180 },
].map((d) => ({ ...d, ...defaultOptions }));

export const ServerTable = (props) => {
  const [initialState] = useState(getInitialStateFromQueryParams);
  const flatDetails = useMemo(() => toFlatData(props.servers), [props.servers]);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        theme={theme}
        enableCellTextSelection
        rowBuffer={5}
        animateRows={false}
        suppressColumnMoveAnimation
        rowData={flatDetails}
        columnDefs={columnDefs}
        initialState={initialState}
      ></AgGridReact>
    </div>
  );
};

const toFlatData = (servers) => {
  const result = [];

  for (let i = 0; i < servers.length; i++) {
    const { address, version, settings, geo } = servers[i];
    result.push({
      hostname: settings.hostname,
      address: settings.hostport || address,
      admin: settings["*admin"],
      version,
      gamedir: settings["*gamedir"],
      ktxver: settings.ktxver,
      sv_antilag: settings.sv_antilag,
      ...geo,
    });
  }

  return result;
};

// e.g. ?country=sweden&gamedir=qw sets the default "contains" filter of each column
const getInitialStateFromQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const filterModel = {};

  for (const { field } of columnDefs) {
    const value = params.get(field);

    if (value) {
      filterModel[field] = {
        filterType: "text",
        type: "contains",
        filter: value,
      };
    }
  }

  return { filter: { filterModel } };
};
