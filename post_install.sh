#!/bin/bash

docker build . -t sm/mediainfo:v20.08
docker run --rm  -it -v "$(pwd)/lib:/data" sm/mediainfo:v20.08 cp /package/lib/libmediainfo.so.0 /data