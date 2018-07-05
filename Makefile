# local intance of selenium

sel: selenium-start
sels: selenium-stop

selenium-start:
	/bin/bash local_selenium_server_ensure.sh

selenium-stop:
	/bin/bash local_selenium_server.sh stop

help:
	@/bin/bash test.sh --help

test-server:
	yarn server

run:
	echo "in order to execute test run directly command\n\n    /bin/bash test.sh\n"

