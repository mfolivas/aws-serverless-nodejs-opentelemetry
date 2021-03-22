FROM node:12

WORKDIR /app
RUN npm install -g serverless && sls create -t aws-nodejs
ADD src .
RUN npm install

CMD [ "npm", "run", "deploy" ]