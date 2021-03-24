FROM node:12

WORKDIR /aws-serverless-nodejs-otel
RUN npm install -g serverless && sls create -t aws-nodejs
ADD serverless.yml .
ADD src .
RUN npm install serverless-pseudo-parameters

CMD [ "npm", "run", "deploy" ]