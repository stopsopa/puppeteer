#!/bin/bash

# /bin/bash local_selenium_server_ensure.sh

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"
echo $DIR;

source "$DIR/config.sh";

STATUS="curl --max-time $CURL_TEST_MAX_TIME http://$HUB_HOST:$HUB_PORT/grid/console"
echo -e "\n >>>> " $STATUS "\n"
RESPONSE=$($STATUS);

HUB="http://$HUB_HOST:$HUB_PORT/grid/console?config=true&configDebug=true&refresh=10"
NODE="http://$NODE_HOST:$NODE_PORT"
CONNECTION="Connection refused"

RESULT="false"

if [[ $RESPONSE = *"$NODE"* ]]; then

    echo -e "\n  Node $NODE is registered in hub $HUB\n"

    if [[ $RESPONSE != *"$CONNECTION"* ]]; then

        echo -e "\n  Node $NODE is registered in hub $HUB and seems to work\n"

        echo -e "\n  All good... \n"

        RESULT="true"

        exit 0;

    else
        echo -e "\n\n    ERROR: Node $NODE is registered in hub $HUB but it doesn't seem work\n\n"
    fi
else
    echo -e "\n\n    ERROR: Node $NODE is NOT registered in hub $HUB\n\n"
fi


if [ "$1" = "" ]; then

    echo -e "\n\n    Let's try to restart...\n\n";

    /bin/bash local_selenium_server.sh

    sleep $WAIT_TO_RUN_SELENIUM_CLUSTER

    /bin/bash local_selenium_server_ensure.sh don-t-restart
else

    echo -e "\n\n    Test failed anyway after attempt to restart - please check it manually, I give up :/ \n\n"

    exit 1

fi

node node_modules/.bin/jest test/warmingup.js --verbose --runInBand


