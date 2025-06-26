FROM node:20.17 AS builder

RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

WORKDIR /home/node

COPY . /home/node
RUN npm install
RUN npx prisma generate
RUN npm run build



FROM node:20.17 AS production

RUN ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN mkdir -p /home/node && chown -R node:node /home/node

WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/
COPY .env /home/node/.env

USER node

ARG PORT
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["node", "dist/server.js"]
