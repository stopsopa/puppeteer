
THISFILE=${BASH_SOURCE[0]}
_DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

if [ "$TARGET" = "" ]; then

    TARGET="default"
fi

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

# echo "TARGET: $TARGET";

D_P_SSH_PORT="$(node $_DIR/configReader.js --param servers.$TARGET.sshport)"
D_P_CONTAINER="$(node $_DIR/configReader.js --param servers.$TARGET.containername)"
D_P_SCHEMA="$(node $_DIR/configReader.js --param servers.$TARGET.schema)"
D_P_HOST="$(node $_DIR/configReader.js --param servers.$TARGET.host)"
D_P_PORT="$(node $_DIR/configReader.js --param servers.$TARGET.port)"
D_P_VOLUME="$(node $_DIR/configReader.js --param rootdir)"
D_P_WORKDIR="$(node $_DIR/configReader.js --param servers.$TARGET.workdir)"
