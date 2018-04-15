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

#if [ "$1" = "--help" ]; then
#
#    cat << EOF
#
## run all and then run only changed (selective)
#    /bin/bash $0 --watch
#
## every time run all
#    /bin/bash $0 --watchAll
#
## run only one or matching test
#    /bin/bash $0 /veg.test.js
#    /bin/bash $0 test/*e*.test.js
#    /bin/bash $0 "[^a-z]tea"
#
## filtering tests by specific filename pattern or test name pattern
#    /bin/bash $0 -t 'dbnochange'
#    /bin/bash $0 test/project/front/page.test.js -t 'dbchange'
#
## run selenium server locally
#    make sel
#
## stopping local selenium sever
#    make sels
#
## sequence of testing selenium testing tools itself
#    make test-server
#    node node_modules/.bin/jest test/examples/ --verbose --runInBand;echo -e "\n\ntests $([ $? == 0 ] && echo "passed" || echo "failed")\n\n"
#
#EOF
#
#    exit 0;
#fi

#echo -e "\n\n ┌────────────────────────────────────────────────────────────────────┐"
#echo -e " │ sequence of checking || running local selenium server before tests │ "
#echo -e " └────────────────────────────────────────────────────────────────────┘\n\n"
#/bin/bash local_selenium_server_ensure.sh
#echo -e "\n ┌────────────────────────────────────────────────────────────────────┐"
#echo -e " │ sequence of checking || running local selenium server before tests │ "
#echo -e " └────────────────────────────────────────────────────────────────────┘\n\n"

#export SELENIUM_REMOTE_URL="http://$HUB_HOST:$HUB_PORT/wd/hub"
#
#export SELENIUM_BROWSER="$BROWSER_NAME:$BROWSER_VERSION:$BROWSER_PLATFORM"

node node_modules/.bin/jest $@ --verbose --runInBand --modulePathIgnorePatterns "test/examples" "test/minefiled" "test/project"

#node node_modules/.bin/jest $@ --verbose --runInBand
#node node_modules/.bin/jest -t="redirection 2" --runInBand --modulePathIgnorePatterns "test/examples"

# other useful options
# --testNamePattern, -t           Run only tests with a name that matches the regex pattern.
#                                 Run tests that match this spec name (match against the name in describe or test, basically).
#           from : https://facebook.github.io/jest/docs/en/cli.html
#       example:
#           /bin/bash run.sh -t="redirection\s2"

STATUS=$?

if [ "$STATUS" == "0" ]; then

    green "\n    Tests passed\n";
else

    red "\n    Tests crashed\n";

    exit $STATUS
fi

