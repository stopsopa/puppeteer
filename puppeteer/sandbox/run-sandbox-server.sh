
set -e
set -o xtrace

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"
pwd

FLAG="state-of-puppeteer-sandbox-server"

PORT="$(node $DIR/../configReader.js --param testServer.port)"

/bin/bash $DIR/kill.sh "$FLAG"

node $DIR/server.js --port $PORT --dir $DIR/.. --log 15 --flag "$FLAG" & disown

sleep 2

# https://superuser.com/a/442395
STATUS="$(curl -s -o /dev/null -I -w "%{http_code}" localhost:$PORT/run-sandbox-server.sh-check)"

if [ "$STATUS" != "201" ]; then

    printf "\n\n    server localhost:$PORT doesn't respond with status 201\n\n"

    exit 1;
fi