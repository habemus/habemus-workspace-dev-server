FROM node:5.0.0
MAINTAINER Simon Fan <sf@habem.us>

COPY . /application

WORKDIR /application

# port must match exposed port
ENV PORT 5001

# directories that must be mounted at run
ENV MONGODB_URI_PATH  /etc/h-dev-cloud/mongodb-uri
ENV WORKSPACE_FS_ROOT /data/workspaces

ENTRYPOINT ["node", "/application/cli/start.js"]

EXPOSE 5001