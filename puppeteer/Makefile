# local intance of selenium

help:
	@/bin/bash test.sh --help

install-local:
	# with bundled chromium
	yarn install

install-prod:
	# without bundled chromium, we gonna use chromium from docker
	# https://github.com/GoogleChrome/puppeteer/issues/244#issuecomment-364222174
	export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && yarn install

# test server
ts: tss
	node sandbox/server.js --log 15 --dir sandbox --flag roderictestserver &

# test server stop
tss:
	/bin/bash sandbox/kill.sh roderictestserver

tst:
	curl "$(shell /bin/bash docker/hostip.sh)$(shell /bin/bash colon.sh)$(shell node configReader.js --param NODE_SSR_PORT)/page?lang=test"

run:
	echo "in order to execute test run directly command\n\n    /bin/bash test.sh\n"

self-test:
	/bin/bash selftest.sh

selftest: self-test


