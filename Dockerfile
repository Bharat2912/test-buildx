#
# Nginx Dockerfile
#
# https://github.com/daockerfile/nginx
#

# Pull base image.
FROM ubuntu:latest

WORKDIR /etc/nginx

# Define default command.
CMD ["nginx"]

# Expose ports.
EXPOSE 80
EXPOSE 443
