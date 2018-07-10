
THISFILE=${BASH_SOURCE[0]}
_DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

D_P_SSH_PORT="$(node $_DIR/configReader.js --param servers.docker.sshport)"
D_P_CONTAINER="$(node $_DIR/configReader.js --param servers.docker.containername)"
D_P_SCHEMA="$(node $_DIR/configReader.js --param servers.docker.schema)"
D_P_HOST="$(node $_DIR/configReader.js --param servers.docker.host)"
D_P_PORT="$(node $_DIR/configReader.js --param servers.docker.port)"
D_P_VOLUME="$(node $_DIR/configReader.js --param rootdir)"
D_P_WORKDIR="$(node $_DIR/configReader.js --param servers.docker.workdir)"
