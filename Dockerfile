FROM node

RUN git config --global user.email "servant@userfeeds.io"
RUN git config --global user.name "Userfeeds Servant"

# Copy all local files into the image.
COPY app /app

WORKDIR /app

RUN npm install yarn
RUN yarn install
RUN yarn build
