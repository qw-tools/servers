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
      defaultStickyColumnName="address"
      defaultSort={["hostname", "asc"]}
    />
  );
};

const toFlatData = (servers) => {
  const result = [];
  const includedSettings = ["maxclients", "maxspectators"];

  for (let i = 0; i < servers.length; i++) {
    const { address, version, settings, geo } = servers[i];
    result.push({
      hostname: settings["hostname"].replaceAll(".", "&#46;"),
      address,
      admin: settings["*admin"],
      ...flatten(versionToObject(version)),
      gamedir: settings["*gamedir"],
      antilag: settings["sv_antilag"],
      ...flatten(_pick(settings, includedSettings)),
      ...flatten(_pick(geo, ["region", "country", "city"])),
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
    version: {
      type,
      build,
    },
  };
};
