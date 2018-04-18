#!/bin/bash

# test script to test stability

COUNTER=1;

while : ; do

    echo -e "\n\ntry: ${COUNTER} vvv\n\n";

#    make sels
#
#    make sel

#    node node_modules/.bin/jest test/examples/ --verbose --runInBand
    /bin/bash run.sh --verbose --runInBand
#    /bin/bash run.sh test/project/front/001-general.test.js -t redirection

    [[ "$?" == "0" ]] || break

    sleep 1

    COUNTER=$((COUNTER+1))
done