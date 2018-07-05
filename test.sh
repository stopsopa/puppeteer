#!/bin/bash

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

source "$DIR/config.sh";

function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

#export SELENIUM_REMOTE_URL="http://$HUB_HOST:$HUB_PORT/wd/hub"
#
#export SELENIUM_BROWSER="$BROWSER_NAME:$BROWSER_VERSION:$BROWSER_PLATFORM"

node node_modules/.bin/jest $@ --bail --verbose --runInBand --modulePathIgnorePatterns "test/examples" "test/minefiled" "test/project"

#node node_modules/.bin/jest $@ --verbose --runInBand
#node node_modules/.bin/jest -t="redirection 2" --runInBand --modulePathIgnorePatterns "test/examples"

# other useful options
# --testNamePattern, -t           Run only tests with a name that matches the regex pattern.
#                                 Run tests that match this spec name (match against the name in describe or test, basically).
#           from : https://facebook.github.io/jest/docs/en/cli.html
#       example:
#           /bin/bash test.sh -t="redirection\s2"

STATUS=$?

if [ "$STATUS" == "0" ]; then

    green "\n    Tests passed\n";
else

    red "\n    Tests crashed\n";

    exit $STATUS
fi

