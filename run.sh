#!/bin/bash

[ ! -d '/tmp/cache' ] && mkdir -p /tmp/cache

ls -l /mnt/spreading-15-89
cd /mnt/spreading-15-89

mkdir -p .next/pages/docs
mkdir -p _docs

sudo mount -t efs -o tls,accesspoint=fsap-0048da4b9e1e50d72 fs-0d941cb6e4d5d582e:/ .next/pages/docs
sudo mount -t efs -o tls,accesspoint=fsap-007645e88f391dc7a fs-0d941cb6e4d5d582e:/ _docs

touch .next/pages/docs/page.text
touch _docs/docs.text

df -h

exec node server.js