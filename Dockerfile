FROM node:5.0.0
MAINTAINER Simon Fan <sf@habem.us>

COPY . /application

# port must match exposed port
ENV PORT 5000

ENTRYPOINT ["node", "/application/cli/start.js"]

EXPOSE 5000
