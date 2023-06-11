FROM node:20-bookworm AS bot-base
WORKDIR /app
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --omit=dev
COPY "src/" "./src/"
CMD ["node", "."]