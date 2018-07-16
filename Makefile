# local intance of selenium

sel: selenium-start
sels: selenium-stop

selenium-start:
	/bin/bash local_selenium_server_ensure.sh

selenium-stop:
	/bin/bash local_selenium_server.sh stop

help:
	@/bin/bash test.sh --help

install-local:
	# with bundled chromium
	yarn install

install-prod:
	# without bundled chromium, we gonna use chromium from docker
	# https://github.com/GoogleChrome/puppeteer/issues/244#issuecomment-364222174
	export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && yarn install

test-server:
	yarn server

run:
	echo "in order to execute test run directly command\n\n    /bin/bash test.sh\n"

