import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { format } from 'timeago.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const fetchGet = async (url) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${url}`)
  }
  return response.json()
};

export const ProjectVersion = React.memo((props) => {
  const { name } = props;

  const query = useQuery(
    [name],
    () => fetchGet(`https://raw.githubusercontent.com/vikpe/qw-data/main/github/${name}_latest_release.json`)
  );

  if (!query.data) {
    return null;
  }

  const timeSince = format(Date.parse(query.data.published_at))

  return (
    <>
      <a href={query.data.html_url}
         style={{ marginLeft: 10 }}><strong>{name} {query.data.tag_name}</strong> ({timeSince})</a>
    </>
  )
});

export const LatestSoftware = React.memo(() => {
  const projects = [
    "mvdsv",
    "ktx",
    "qtv",
    "qwfwd"
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ padding: "1rem", backgroundColor: "#eee", fontSize: ".85em" }}>
        Latest versions: {projects.map(p => <ProjectVersion key={p} name={p} />)}
      </div>
    </QueryClientProvider>
  )
});
