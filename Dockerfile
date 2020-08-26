FROM lambci/lambda:build-nodejs12.x

WORKDIR /
RUN yum update -y

# Install Python 3.8
RUN yum -y install openssl-devel bzip2-devel libffi-devel wget tar gzip make gcc-c++

# Download MediaInfo
WORKDIR /root
RUN wget https://mediaarea.net/download/binary/libmediainfo0/20.08/MediaInfo_DLL_20.08_GNU_FromSource.tar.gz
RUN tar -xzvf MediaInfo_DLL_20.08_GNU_FromSource.tar.gz

# Compile MediaInfo with Support for URL Inputs
WORKDIR /root/MediaInfo_DLL_GNU_FromSource/
RUN ./SO_Compile.sh
WORKDIR /

RUN mkdir -p /package/lib
# Create zip files for Lambda Layer deployment
RUN cp /root/MediaInfo_DLL_GNU_FromSource/MediaInfoLib/Project/GNU/Library/.libs/* /package/lib

