#!/bin/bash
python -m SimpleHTTPServer &
pid=$!
kill_server () {
    echo "Killing server"
    kill $pid
}
trap kill_server EXIT INT
make watch
