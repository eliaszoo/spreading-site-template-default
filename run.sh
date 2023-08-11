#!/bin/bash

[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

cd /mnt/spreading-15-44
exec node server.js