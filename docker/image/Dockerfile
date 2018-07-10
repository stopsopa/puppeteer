FROM browserless/chrome:release-puppeteer-1.5.0

# TO BUILD THIS IMAGE:
    # docker build -t browserless/chrome:test .

# to reset build run
#   docker rm puppeteer-docker --force && docker rmi browserless/chrome:test

# to check what's inside run:
#   docker exec -it puppeteer-docker bash

# net-tools for netstat -ntpl

COPY ./run.sh .

RUN apt-get update \
    && apt install openssh-server -y \
    && systemctl enable ssh \
    && update-rc.d ssh defaults \
    && service ssh start \
    && apt install net-tools -y \
    && mkdir ~/.ssh \
    && echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDVegRLLTELe8yxvjG+VHDYMhRpDLDa3TN78IFeQZW8WsDw6eKKt8BXoXNEzMigs1hFOuZmmemdesTa8il3WAe7W8FBNm44MrlDfYfBXN7UH14hpI3ruiFm/w2gAHLZH6lgejB09+nBr3OXBEZhVFOYeeFMMQBp8JyhxvL3Am91vbyjnggF39d3ZIGbqUBDgP0+H5I5lJYI71/5vheSvUpxofzb5BigPwY1aKQBcWF5cWL2fS0OZ/me54k4u4uX8h0/qtftQEvU1GZbbdex9fWHQ5/f+14l/Osn3yBAiFW3Ow+/4KKgXbsp1Yf1RBJh1VdxmmUNfTS4s84578R6dkCl puppeteer@host.com' > ~/.ssh/authorized_keys \
    && chmod 600 ~/.ssh/authorized_keys \
    && chmod 700  ~/.ssh/ \
    && printf "\n\nexport ROOTDIR=/var/app/runtime\nexport TARGET=docker\n\n"  >> ~/.bashrc

WORKDIR /var/app/runtime

CMD [ "/bin/bash", "/usr/src/app/run.sh" ]