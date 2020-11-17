#!/usr/bin/env bash

cd packages
cd guardian-crypto && yarn publish:beta && cd ..
cd guardian-transactions && yarn publish:beta && cd ..
cd guardian-api && yarn publish:beta && cd ..
