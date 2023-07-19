#!/bin/bash

Rebuild="Rebuild"
if [ "$BuildType" = "$Rebuild" ]
then # 全量
    echo "Rebuild"
    python rebuild.py -w $Workspace -s $Site -b $BaseDomain -t $Token
else # 增量
    echo "Incremental"
    python incremental.py  -w $Workspace -s $Site -b $BaseDomain -t $Token -p $Project -f "$UpdateFiles" -o "$OutputFolder"
fi