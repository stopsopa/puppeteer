
set -e

/bin/bash test.sh
/bin/bash test.sh --target dochost
/bin/bash test.sh --target docssh

function green {
    printf "\e[32m$1\e[0m\n"
}

green "\n\n    Self-test passed... \n\n";