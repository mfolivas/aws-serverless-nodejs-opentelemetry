FROM node:12

WORKDIR /app
RUN npm install -g serverless && sls create -t aws-nodejs && npm install
COPY handler.js counter.js package.json ./

CMD [ "npm", "deploy" ]