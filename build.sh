#!/bin/bash

if [ $Rebuilt == true ]
then # 全量
    python3 build.py -s $Site -b $BaseDomain -t $Token
else # 增量
    python3 build.py
fi

if [ $PublishType == "preview" ]
then
    echo "this is preview"
else
    echo "a is not equal to b"
fi