#!/bin/bash

# /bin/bash local_selenium_server.sh
# /bin/bash local_selenium_server.sh stop

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"
echo $DIR;

source "$DIR/config.sh";

if [ "$1" == "rm" ]; then
    rm -rf ./sessions/*.json
    exit 0;
fi

echo "stopping hub & node"

kill -9 $(ps aux | grep -v grep | grep selenium | grep -v $$ | grep -v ".sh" | awk '{print $2}')

echo 'double check:'
ps aux | grep -v grep | grep selenium | grep -v $$

if [ "$1" != "stop" ]; then
    echo "starting hub & node"

    if [ ! -f selenium-server-standalone-3.4.0.jar ]; then
#        curl -O https://raw.githubusercontent.com/stopsopa/research-protractor/master/mac/geckodriver
#        curl -O https://raw.githubusercontent.com/stopsopa/research-protractor/master/mac/chromedriver
        curl -O https://raw.githubusercontent.com/stopsopa/research-protractor/master/selenium-server-standalone-3.4.0.jar

#        chmod a+x chromedriver
#        chmod a+x geckodriver
    fi

    if [ ! -f chromedriver ]; then

        RUN="wget https://chromedriver.storage.googleapis.com/2.36/chromedriver_mac64.zip"
        echo -e "\n\n >> $RUN\n\n";
        $RUN

        RUN="unzip chromedriver_mac64.zip"
        echo -e "\n\n >> $RUN\n\n";
        $RUN

        RUN="rm -rf chromedriver_mac64.zip"
        echo -e "\n\n >> $RUN\n\n";
        $RUN

        RUN="chmod a+x chromedriver"
        echo -e "\n\n >> $RUN\n\n";
        $RUN
    fi

# https://seleniumhq.github.io/docs/grid.html
cat <<EOF | tee hubConfig.json
{
    "_comment" : "Configuration for Hub - hubConfig.json: https://seleniumhq.github.io/docs/grid.html",
    "host": "$HUB_HOST",
    "port": $HUB_PORT
}
EOF

    java -jar selenium-server-standalone-3.4.0.jar \
        -role hub \
        -hubConfig hubConfig.json \
    & disown

    sleep 3

    java -jar selenium-server-standalone-3.4.0.jar \
        -role node \
        -port $NODE_PORT \
        -host $NODE_HOST \
        -hub http://$HUB_HOST:$HUB_PORT/grid/register \
        -browser "browserName=$BROWSER_NAME, version=$BROWSER_VERSION, maxInstances=$BROWSER_MAXINST, platform=$BROWSER_PLATFORM" \
    & disown

#    java -jar selenium-server-standalone-3.4.0.jar -role node -port 5555 -host 127.0.0.1 -hub http://localhost:4444/grid/register -browser "browserName=chrome, maxInstances=10, platform=SIERRA" -browser "browserName=firefox, maxInstances=10, platform=SIERRA" -browser "browserName=safari, maxInstances=10, platform=SIERRA" & disown

    # java -jar selenium-server-standalone-3.4.0.jar -role node -port 5555 -browser "browserName=chrome, maxInstances=10, platform=SIERRA"

    sleep $WAIT_TO_RUN_SELENIUM_CLUSTER

    echo -e "\n\nup and running... visit: \n    http://$HUB_HOST:$HUB_PORT/grid/console?config=true&configDebug=true&refresh=10\n\n"
fi



