# QuakeWorld Servers [![Deploy](https://github.com/qw-tools/servers/actions/workflows/deploy.yaml/badge.svg?branch=main)](https://github.com/qw-tools/servers/actions/workflows/deploy.yaml)

:link: **https://tools.quake.world/servers/**

Overview of QuakeWorld servers, shown as a table, a world map or cards per host (ip).

## Data sources

* Servers: [api.quake.world/v1/servers](https://api.quake.world/v1/servers)
* Geo data: [qw-servers-geoip](https://github.com/vikpe/qw-servers-geoip)

## Links

Settings can be linked using query params, e.g. `?view=map&types=qtv`.

| Param      | Description                                                     | Remembered |
|------------|-----------------------------------------------------------------|------------|
| `view`     | `table` (default), `map` or `cards`                             | yes        |
| `group`    | Host cards grouping: `none` (default), `region` or `admin`      | yes        |
| `types`    | Only show these server types: `qtv`, `proxy`, e.g. `qtv,proxy`  | yes        |
| `filter`   | Free text filter, e.g. `?filter=sweden`                         | yes        |
| `<column>` | Table column filter, e.g. `?view=table&country=sweden`          | no         |

Remembered settings are stored in the browser (local storage), a query param in a link takes precedence.

## Development

### Requirements

* [Node.js](https://nodejs.org/) LTS
* [pnpm](https://pnpm.io/) 12 (version set in `package.json`, e.g. via `corepack enable`)
* [Mapbox](https://www.mapbox.com/) access token, for the world map

### Setup

```shell
# clone repo
git clone git@github.com:qw-tools/servers.git
cd servers

# install dependencies
pnpm install

# mapbox access token for the world map
cp .env.example .env.local # then set VITE_MAPBOX_ACCESS_TOKEN

# start dev server
pnpm dev
```

dev server is hosted at http://localhost:5173

### Commands

| Command         | Description                                       |
|-----------------|---------------------------------------------------|
| `pnpm dev`      | Start development server at http://localhost:5173 |
| `pnpm build`    | Build site to `/dist`                             |
| `pnpm preview`  | Serve `/dist` at http://localhost:4173/servers/   |
| `pnpm format`   | Format code (Biome)                               |
| `pnpm lint`     | Lint code (Biome)                                 |
| `pnpm check`    | Lint, check formatting and import order (Biome)   |

### Deploy

Pushes to `main` are linted, built and deployed to GitHub Pages (`.github/workflows/deploy.yaml`).

The repo needs the secret `VITE_MAPBOX_ACCESS_TOKEN`. The token is public (included in the built JavaScript),
restrict it to `tools.quake.world` in the Mapbox dashboard.
