import React from "react";
import { useSelector } from "react-redux";
import { selectAllServers } from "../services/qws.js";
import { Grid } from "@githubocto/flat-ui";
import flatten from "flat";
import _pick from "lodash.pick";

export const ServerTable = () => {
  const servers = useSelector(selectAllServers);
  const flatData = toFlatData(servers);

  return (
    <Grid
      data={flatData}
      defaultStickyColumnName="Address"
      defaultSort={["Hostname", "asc"]}
    />
  );
};

const toFlatData = (servers) => {
  const result = [];
  const includedSettings = [
    "*admin",
    "*gamedir",
    "ktxver",
    "sv_antilag",
    "maxclients",
    "maxspectators",
  ];

  for (let i = 0; i < servers.length; i++) {
    const { Address, Version, Settings = {}, ExtraInfo } = servers[i];
    result.push({
      Hostname: Settings["hostname"].replaceAll(".", "&#46;"),
      Address,
      ...flatten(versionToObject(Version)),
      ...flatten(_pick(Settings, includedSettings)),
      ...flatten(_pick(ExtraInfo["Geo"], ["Region", "Country", "City"])),
      Coordinates: ExtraInfo["Geo"]["Coordinates"],
    });
  }

  return result;
};

const versionToObject = (version) => {
  let type;
  let build = "";

  if (version.includes(" ")) {
    const versionParts = version.split(" ");
    type = versionParts[0];
    build = version;
  } else {
    type = version;
  }

  return {
    Version: {
      type,
      build,
    },
  };
};
