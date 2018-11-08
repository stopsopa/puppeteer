
THISFILE=${BASH_SOURCE[0]}
DIR="$( cd "$( dirname "${THISFILE}" )" && pwd -P )"

function red {
    printf "\e[91m$1\e[0m\n"
}
function green {
    printf "\e[32m$1\e[0m\n"
}

green "\n    fetching variables:\n"

source "$DIR/../config.sh";

set -e
set -x

green "\n    build image:\n"

(cd $DIR/image && docker build -t browserless/chrome:test .)

green "\n    stop container:\n"

docker rm $D_P_CONTAINER --force || true

green "\n    find host ip:\n"


if [ "$(uname)" == "Linux" ]; then
    # https://stackoverflow.com/a/25851186
    IP="$(ip route get 1 | awk '{print $NF;exit}')"
else
    # https://stackoverflow.com/a/46565139
    # http://osxdaily.com/2010/11/21/find-ip-address-mac/
    # https://stackoverflow.com/a/1103177
    # g(find local lan ip mac)
    # IP="$(ipconfig getifaddr en0)" - old version, doesn't work on mac in all cases
    IP="$(ifconfig | grep "inet " | tail -n 1 | perl -pe 's#^.*?(\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}).*$#\1#')"
fi

green "\n    its: $IP\n"

#exit 0

RUN=$(cat <<END
docker run \
-d \
--rm \
--add-host=host:$IP \
-e "TARGET=docker" \
--name $D_P_CONTAINER \
-v $D_P_VOLUME:$D_P_WORKDIR \
--shm-size=1gb \
-p 3000:3000 \
-p $D_P_SSH_PORT:22 \
browserless/chrome:test
END
);
green "\n    run container:\n"

green "\n\n    $RUN\n\n"

$RUN

green "\n    D_P_SSH_PORT=>$D_P_SSH_PORT<\n"

if [ "$D_P_SSH_PORT" = "" ]; then

    green "\n    No need to connect through ssh to docker container\n"
else

    green "\n    remove key from known_hosts:\n"

    ssh-keygen -R [localhost]:$D_P_SSH_PORT

    chmod 600 "$DIR/image/ssh/id_rsa"

    # ssh -o "StrictHostKeyChecking no" root@localhost -p $D_P_SSH_PORT -i $DIR/image/ssh/id_rsa

    set +e
    set -x

    SSHTIMEOUT=5
    ATTEMPT=1
    green "\n    create tunnel (TIMEOUT: $SSHTIMEOUT sec):\n"

            START="$(date +%s)"

            while true
            do

                green "\n    $ATTEMPT attempt to connect to docker container\n"

                ssh -o "StrictHostKeyChecking no" root@localhost -fN -p $D_P_SSH_PORT -i "$DIR/image/ssh/id_rsa" -R $D_P_PORT:localhost:$D_P_PORT -v -C

                S="$?"
                sleep 0.3

                DIFF=$(($(date +%s) - $START))

                echo "S=$S"

                if [ "$S" = "0" ]; then

                    green "\n    Managed to connect through ssh to docker container\n"

                    break;
                fi

                if [ $DIFF -gt $SSHTIMEOUT ]; then

                    red "\n    Couldn't connect through ssh to docker container within $SSHTIMEOUT timeout\n";

                    exit 1
                fi

                ATTEMPT=$(($ATTEMPT+1))
            done

    # echo pass | openssl passwd -1 -stdin
    # return: $1$Rm2xUno3$475a71Aa6...NGCPaCzt81
    # then run:
    # usermod --password \$1\$Rm2xUno3\$475a71Aa6...NGCPaCzt81 root
    #   from: https://askubuntu.com/a/80447
    # then login from host
    #   ssh root@localhost -p 2222
    # and give a password 'pass'


    # stop container and tunnel
fi

