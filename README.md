# QuakeWorld Servers Overview [![Deploy](https://github.com/qw-tools/servers/actions/workflows/deploy.yaml/badge.svg?branch=main)](https://github.com/qw-tools/servers/actions/workflows/deploy.yaml)

:link: **https://tools.quake.world/servers/**

## Data sources

**Master servers**

```
master.quakeworld.nu:27000
master.quakeservers.net:27000
qwmaster.ocrana.de:27000
qwmaster.fodquake.net:27000
```

**Geo data**

* [qw servers geo data](https://github.com/vikpe/qw-servers-geoip)

## Development

### Setup

```shell
# clone repo
git clone git@github.com:qw-tools/hud-numbers.git
cd hud-numbers

# install dependencies
yarn install

# start dev server
yarn dev
```

dev server is hosted at http://localhost:5173

### Commands

| Command        | Description                                       |
|----------------|---------------------------------------------------|
| `yarn dev`     | Start development server at http://localhost:5173 |
| `yarn build`   | Build site to `/dist`                             |
| `yarn serve`   | Serve `/dist` at http://localhost:4173            |
| `yarn foprmat` | Run formatter                                     |
