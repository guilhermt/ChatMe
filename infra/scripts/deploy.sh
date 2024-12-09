#!/bin/bash

if [[ "$1" == "-p" ]]; then
  export NODE_ENV=prod
else
  export NODE_ENV=dev
fi

cd ../web
yarn
yarn build:${NODE_ENV}
  

cd ../infra
yarn
cdk deploy --all --require-approval never

