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
    #aws apigatewayv2 create-domain-name --domain-name test11.spreading.io --domain-name-configurations CertificateArn=arn:aws:acm:ap-southeast-1:547537176727:certificate/3737d1ce-54b7-411f-9e2b-659781a8e7a8
    aws apigatewayv2 create-api-mapping --domain-name test11.spreading.io --api-id 5ale2103dk --stage '$default'
fi