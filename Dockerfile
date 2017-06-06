FROM node:7.8.0

ENV NPM_CONFIG_LOGLEVEL warn

# Copy all local files into the image.
COPY app /app

WORKDIR /app

RUN npm install
RUN npm run build --production

RUN npm install -g serve

CMD serve -s build

# Tell Docker about the port we'll run on.
EXPOSE 5000
