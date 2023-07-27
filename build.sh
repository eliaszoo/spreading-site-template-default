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
    aws apigateway create-domain-name --domain-name test3.spreading.io --certificate-arn arn:aws:acm:us-east-1:547537176727:certificate/06e7f446-2952-42ad-bb0c-9d8e5e144808 --region ap-southeast-1
    aws apigateway create-base-path-mapping --domain-name test3.spreading.io --base-path "" --rest-api-id 5ale2103dk --region ap-southeast-1
fi