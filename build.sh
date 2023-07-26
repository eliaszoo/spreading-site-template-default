#!/bin/bash

Rebuild="Rebuild"
Incremental="Incremental"
if [ "$BuildType" = "$Rebuild" ]
then # 全量
    echo "Rebuild"
    sudo npm install -g pnpm
    python rebuild.py -w $Workspace -s $Site -b $BaseDomain -t $Token -c $Callback
elif [ "$BuildType" = "$Incremental" ]
then
    echo "Incremental"
    python incremental.py  -w $Workspace -s $Site -b $BaseDomain -t $Token -p $Project -f "$UpdateFiles" -o "$OutputFolder"  -c $Callback
else # 增量
    echo "test"
    aws apigateway create-base-path-mapping --domain-name test2.spreading.io --rest-api-id 5ale2103dk --stage prod
fi