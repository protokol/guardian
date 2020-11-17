#!/usr/bin/env bash

cd packages
cd guardian-crypto && npm publish --tag beta --access public --tolerate-republish && cd ..
cd guardian-transactions && npm publish --tag beta --access public --tolerate-republish && cd ..
cd guardian-api && npm publish --tag beta --access public --tolerate-republish && cd ..
