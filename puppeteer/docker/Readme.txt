
# https://docs.docker.com/engine/reference/run/#network-host
# docker run --rm --net=host --shm-size=1gb -p 3000:3000 browserless/chrome

docker run --rm --shm-size=1gb -p 3000:3000 browserless/chrome
docker run --rm --shm-size=1gb -p 3000:3000 browserless/chrome:test



ssh localhost -p 2222 -i image/ssh/id_rsa


ssh-keygen -R [localhost]:2222
ssh -o "StrictHostKeyChecking no" root@localhost -p 2222 -i image/ssh/id_rsa






curl https://registry.hub.docker.com/v1/repositories/php/tags
curl https://registry.hub.docker.com/v1/repositories/browserless/chrome/tags
curl https://registry.hub.docker.com/v1/repositories/php/tags | python -m json.tool
wget -O- https://registry.hub.docker.com/v1/repositories/php/tags | python -m json.tool
















