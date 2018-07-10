
THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

set -e
set -x

function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

green "\n    fetching variables:\n"

source "$DIR/../config.sh";

green "\n    build image:\n"

(cd $DIR/image && docker build -t browserless/chrome:test .)

green "\n    stop container:\n"

docker rm $D_P_CONTAINER --force || true

RUN=$(cat <<END
docker run \
-d \
--rm \
-e "TARGET=docker" \
--name $D_P_CONTAINER \
-v $D_P_VOLUME:/var/app/runtime \
--shm-size=1gb \
-p 3000:3000 \
-p $D_P_SSH_PORT:22 browserless/chrome:test
END
);
green "\n    run container:\n"

green "\n\n    $RUN\n\n"

$RUN

green "\n    remove key from known_hosts:\n"

ssh-keygen -R [localhost]:$D_P_SSH_PORT

# ssh -o "StrictHostKeyChecking no" root@localhost -p $D_P_SSH_PORT -i image/ssh/id_rsa

green "\n    create tunnel:\n"

ssh -o "StrictHostKeyChecking no" root@localhost -fN -p $D_P_SSH_PORT -i "$DIR/image/ssh/id_rsa" -R $D_P_PORT:localhost:$D_P_PORT -v -C

# stop container and tunnel
