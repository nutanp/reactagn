#!/usr/bin/env bash

set -e -u -x

mv dependency-cache/node_modules  agn-source-code
cd agn-source-code  && npm run build:qa
cd ..
mv agn-source-code/node_modules agn-qa
mv agn-source-code/public agn-qa
mv agn-source-code/config agn-qa
cp agn-source-code/manifest-qa.yaml agn-qa/manifest-qa.yaml
cp agn-source-code/package.json agn-qa/package.json
cp agn-source-code/package-lock.json agn-qa/package-lock.json
cp agn-source-code/config.js agn-qa/config.js
cp agn-source-code/constants.js agn-qa/constants.js
cp agn-source-code/server.js agn-qa/server.js
echo "Done!"