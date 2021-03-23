FROM node:12

WORKDIR /app
RUN npm install -g serverless && sls create -t aws-nodejs
ADD serverless.yml .
ADD src .
RUN npm install serverless-pseudo-parameters aws-xray-sdk-core

CMD [ "npm", "run", "deploy" ]