#!/bin/bash

# test script to test stability

while : ; do

    make sels

    make sel

#    node node_modules/.bin/jest test/examples/ --verbose --runInBand
    /bin/bash run.sh --verbose --runInBand

    [[ "$?" == "0" ]] || break

    sleep 1
done