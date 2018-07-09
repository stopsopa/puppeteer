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

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

if [ "$1" = "--help" ]; then

cat << EOF

    /bin/bash $0 --help
    /bin/bash $0 --target default
    /bin/bash $0 --target sandbox
    /bin/bash $0 --target other test/test.js

EOF

    exit 0
fi

TARGET="default"

if [ "$1" = "--target" ]; then

    TARGET="$2";

    shift;

    shift;
fi

TARGET="$(trim "$TARGET")"

if [ "$TARGET" = "" ]; then

    red "TARGET environment variable is empty specify it using $0 --target 'target_value'"

    exit 1
fi

export TARGET="$TARGET"

BEFORESCRIPT="node configReader.js --param servers.$TARGET.runbefore"

BEFORE="$($BEFORESCRIPT)"

BEFORESTATUS="$?"

if [ "$BEFORESTATUS" = "100" ]; then

cat << EOF

    Value 'servers.$TARGET' in not found in config,
    but that's ok there is just nothing to run before tests...

EOF

else

    if [ "$BEFORESTATUS" != "0" ]; then

        red "$BEFORESCRIPT - crashed ... "

        exit 1;
    fi
fi

BEFORE="$(trim "$BEFORE")"

set -e
set -o xtrace

if [ "$BEFORE" != "" ]; then

    green "\n    There is something to run before tests, it is:\n        $BEFORE\n"

    $BEFORE;

    green "\n ^^^^^ end ^^^^^\n"
fi

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

if [ "$STATUS" = "0" ]; then

    green "\n    Tests passed\n";
else

    red "\n    Tests crashed\n";

    exit $STATUS
fi

