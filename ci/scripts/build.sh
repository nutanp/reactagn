#!/usr/bin/env bash

set -e -u -x

mv dependency-cache/node_modules  agn-source-code
cd agn-source-code  && npm run build:prod
cd ..
mv agn-source-code/node_modules agn-ui
mv agn-source-code/public agn-ui
mv agn-source-code/config agn-ui
cp agn-source-code/manifest-dev.yaml agn-ui/manifest-dev.yaml
cp agn-source-code/package.json agn-ui/package.json
cp agn-source-code/package-lock.json agn-ui/package-lock.json
cp agn-source-code/config.js agn-ui/config.js
cp agn-source-code/constants.js agn-ui/constants.js
cp agn-source-code/server.js agn-ui/server.js
echo "Done!"