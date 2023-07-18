#!/bin/bash

if [ $Rebuilt == true ]
then # 全量
    python3 build.py -w $Workspace -s $Site -b $BaseDomain -t $Token
else # 增量
    python3 incr_update.py  -w $Workspace -s $Site -b $BaseDomain -t $Token -p $Project -f $UpdateFiles -o $OutputFolder
fi