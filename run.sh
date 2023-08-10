#!/bin/bash

[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

cp -rf * /mnt/spreading-15-44
cd /mnt/spreading-15-44
exec node server.js