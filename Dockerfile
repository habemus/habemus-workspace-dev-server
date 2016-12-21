FROM node:5.0.0
MAINTAINER Simon Fan <sf@habem.us>

COPY . /application

# there are libs that must be rebuilt
# For some unknown reason, rebuild is not working well with posix
# TODO: critical: automated build CI with access to bitbucket keys
# RUN ["npm", "rebuild"]
# 
# ATTENTION: this might break because the dependency on posix
# is of a submodule (dev-server-html5)
RUN ["rm", "-rf", "/application/node_modules/posix"]
RUN ["npm", "install", "posix"]

# port must match exposed port
ENV PORT 5000

ENTRYPOINT ["node", "/application/cli/start.js"]

EXPOSE 5000
