#!/bin/bash

THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

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
    /bin/bash $0 --target travis
    /bin/bash $0 --target docssh -t agent
    /bin/bash $0 --target dochost test/test.js

EOF

    exit 0
fi

source "$DIR/config.sh";



printf "\n\n"
echo "D_P_SSH_PORT  =   >$D_P_SSH_PORT<"
echo "D_P_CONTAINER =   >$D_P_CONTAINER<"
echo "D_P_SCHEMA    =   >$D_P_SCHEMA<"
echo "D_P_HOST      =   >$D_P_HOST<"
echo "D_P_PORT      =   >$D_P_PORT<"
echo "D_P_VOLUME    =   >$D_P_VOLUME<"
echo "D_P_WORKDIR   =   >$D_P_WORKDIR<"
printf "\n\n"

BEFORESCRIPT="node configReader.js --param servers.$TARGET"

BEFORE="$($BEFORESCRIPT)"

BEFORESTATUS="$?"

if [ "$BEFORESTATUS" = "100" ]; then


HELP="

    Value 'servers.$TARGET' in not found in config,
    but that's probably ok there is just nothing to run before tests...

"

red "$HELP";


exit 1

fi

BEFORESCRIPT="node configReader.js --param servers.$TARGET.runbefore"

BEFORE="$($BEFORESCRIPT)"

BEFORESTATUS="$?"

if [ "$BEFORESTATUS" = "100" ]; then

cat << EOF

    Value 'servers.$TARGET.runbefore' in not found in config,
    but that's probably ok there is just nothing to run before tests...

EOF

else

    if [ "$BEFORESTATUS" != "0" ]; then

        red "$BEFORESCRIPT - crashed ... "

        exit 1;
    fi
fi

set -e
set -o xtrace

export TARGET="$TARGET"

ROOTDIR="$D_P_VOLUME"

if [ "$D_P_WORKDIR" != "" ]; then

    ROOTDIR="$D_P_WORKDIR"
fi

export ROOTDIR="$ROOTDIR"

green "\n    ROOTDIR: $ROOTDIR\n"

BEFORE="$(trim "$BEFORE")"

if [ "$BEFORE" != "" ]; then

    green "\n    There is something to run before tests, it is:\n        $BEFORE\n"

    $BEFORE;

    green "\n ^^^^^ end ^^^^^\n"
else
    green "\n    There is no script to run before tests...\n"
fi

TEST="$(cat <<END
node node_modules/.bin/jest \
$@ \
--bail \
--verbose \
--runInBand \
--modulePathIgnorePatterns test/examples test/minefiled test/project
END
)";

# running test server
make ts

WARM="node node_modules/.bin/jest test/warmingup.test.js --verbose --runInBand"

green "\n\n    warming up browser:\n        $WARM\n\n"

$WARM || true

green "\n\n    executing tests:\n        $TEST\n\n"

$TEST

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

