FROM node:12

ADD src /app/
WORKDIR /app
RUN npm install -g serverless && sls create -t aws-nodejs && npm install

CMD [ "npm", "run", "deploy" ]