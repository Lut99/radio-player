#!/bin/bash
# LAUNCH.sh
#   by Lut99
#
# Created:
#   17 Jul 2024, 20:50:55
# Last edited:
#   17 Jul 2024, 22:40:02
# Auto updated?
#   Yes
#
# Description:
#   Implements a script for launching the (static) website using the [static
#   website host](https://github.com/Lut99/static-website-host)-project.
#


##### HELPER FUNCTIONS #####
function run_cmd {
    # Run whatever is given as one command
    scmd=""
    for arg in "$@"; do
        if [[ ! -z "$scmd" ]]; then scmd="$scmd "; fi
        if [[ "$arg" =~ \  ]]; then
            scmd="${scmd}\"$arg\""
        else
            scmd="${scmd}$arg"
        fi
    done

    # Run it
    echo " > $scmd"
    bash -c "$scmd"
    return "$?"
}





##### INIT #####
# Always run in the script directory
cd "$(dirname "$0")"

# Parse arguments
addr="127.0.0.1:42080"
target_dir="./"
use_docker=0

args=("$@")
allow_opts=1
state=0
i=0
pos_i=0
errors=""
while [ "$i" -lt "$#" ]; do
    arg="${args[$i]}"

    # Switch on the state
    if [[ "$state" -eq 0 ]]; then
        if [[ "$allow_opts" -eq 1 && "$arg" =~ ^- ]]; then
            # Match the option
            if [[ "$arg" == "-a" || "$arg" == "--addr" || "$arg" == "--address" ]]; then
                # The next one is the argument
                i=$((i+1))
                addr="${args[$i]}"
            elif [[ "$arg" == "-d" || "$arg" == "--dir" ]]; then
                # The next one is the argument
                i=$((i+1))
                target_dir="${args[$i]}"
            elif [[ "$arg" == "--help" ]]; then
                echo "Usage: $0 [OPTS]"
                echo ""
                echo "Options:"
                echo "  -a,--addr,--address <IP:PORT>"
                echo "                    The IP/port-pair to which to bind the server."
                echo "                    DEFAULT: 127.0.0.1:42080"
                echo "  -d,--dir <PATH>   The directory where the server will be set up."
                echo "                    DEFAULT: ./"
                echo "  -D,--docker       If given, builds a Docker image instead of a native binary."
                echo "  -h,--help         Shows this help menu, then exits."
                echo "  --                When given, stopts parsing arguments with '-' as options."
                echo ""
                exit 0
            elif [[ "$arg" == "-D" || "$arg" == "--docker" ]]; then
                use_docker=1
            elif [[ "$arg" == "--" ]]; then
                allow_opts=0
            else
                errors="${errors}Unknown option '$arg'\n"
            fi
            i=$((i+1))
        else
            # Match the positional index
            if [[ "$pos_i" -ge 0 ]]; then
                errors="${errors}Unexpected positional '$arg'\n"
            fi
            pos_i=$((pos_i+1))
            i=$((i+1))
        fi
    fi
done
if [[ ! -z "$errors" ]]; then
    2>&1 printf "$errors"
    exit 1
fi





##### SCRIPT #####
# Go to the directory we're making
if [[ ! -d "$target_dir" ]]; then
    run_cmd mkdir -p "$target_dir" || exit "$?"
fi
pushd "$target_dir"

# Pull the repository
if [[ ! -d "$target_dir/static-website-host" ]]; then
    run_cmd git clone https://github.com/Lut99/static-website-host || exit "$?"
fi

# Go into it
pushd ./static-website-host
# Build natively if we haven't already
if [[ "$use_docker" -eq 0 && ! -f "./target/release/static-website-host" ]]; then
    run_cmd cargo build --release
fi

# Prepare the config
if [[ ! -f "./config.yml" ]]; then
    echo " > Generating config file..."
    if [[ "$use_docker" -eq 0 ]]; then
        www_dir="../www"
    else
        www_dir="/www"
    fi
    printf "# CONFIG.yml\n#   by launch.sh\n# \n# Configuration for the static-website-host such that it hosts the radio-player.\n# \n\nsite: ${www_dir}\nnot_found_file: ${www_dir}/not_found.html\n" > ./config.yml || exit "$?"
fi

# OK, launch the server
if [[ "$use_docker" -eq 0 ]]; then
    run_cmd ./target/release/static-website-host --address "$addr"
else
    PORT="$addr" WWW_DIR="../www" docker compose up -d
fi

# Done
popd
popd
