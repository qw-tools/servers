import React, { useEffect, useState } from "react";
import { format } from "timeago.js";

export const ProjectVersion = React.memo((props) => {
  const { name } = props;

  const [release, setRelease] = useState({});

  useEffect(() => {
    const latestReleaseUrl = `https://raw.githubusercontent.com/vikpe/qw-data/main/github/${name}_latest_release.json`;

    fetch(latestReleaseUrl)
      .then((data) => data.json())
      .then((release) => setRelease(release));
  }, []);

  if (release === {}) {
    return null;
  }

  const timeSince = format(Date.parse(release.published_at));

  return (
    <a href={release.html_url} style={{ marginLeft: 10 }}>
      <strong>
        {name} {release.tag_name}
      </strong>{" "}
      ({timeSince})
    </a>
  );
});

export const LatestSoftware = React.memo(() => {
  const projects = ["mvdsv", "ktx", "qtv", "qwfwd"];

  return (
    <div className="p-2 bg-gray-100 text-sm">
      Latest versions:{" "}
      {projects.map((p) => (
        <ProjectVersion key={p} name={p} />
      ))}
    </div>
  );
});
