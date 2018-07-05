start: stop
	# specify exact command to run from 'this' directory perspective
	/bin/bash make/start.sh /bin/bash run.sh

stop:
	# FLAG - name of variable with flag
	# .env - (optional) file with config to load to provide FLAG
	/bin/bash make/stop.sh FLAG .env

status:
	# FLAG - name of variable with flag
	# .env - (optional) file with config to load to provide FLAG
	/bin/bash make/status.sh FLAG .env

# test
t:
	/bin/bash test/test.sh
