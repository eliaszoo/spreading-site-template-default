#!/bin/bash

Rebuild="Rebuild"
echo "BuildType: $BuildType"
echo "Rebuild: $Rebuild"
if [[ $BuildType == $Rebuild ]]
then # 全量
    echo "Rebuild"
    python rebuild.py -w $Workspace -s $Site -b $BaseDomain -t $Token
else # 增量
    echo "Incremental"
    python incr_update.py  -w $Workspace -s $Site -b $BaseDomain -t $Token -p $Project -f "$UpdateFiles" -o "$OutputFolder"
fi