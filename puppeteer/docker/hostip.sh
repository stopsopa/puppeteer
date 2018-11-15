

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

echo $IP;