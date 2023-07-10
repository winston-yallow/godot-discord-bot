# Common base stage
#  - uses dedicated app user 'bot'
#  - configures workdir as '/home/bot'
#  - copies npm package files
FROM node:20-bookworm AS bot-base
RUN groupadd -r bot \
	&& useradd --no-log-init -g bot bot
USER bot
WORKDIR /home/bot
COPY --chown=bot:bot ["package.json", "package-lock.json", "./"]

# Development build:
#  - includes all dev dependencies
#  - does not contain './src' dir (should be supplied as a container volume)
#  - uses nodemon for restarting the server automatically on file changes
FROM bot-base AS bot-dev
ENV NODE_ENV=development
RUN npm install && npm cache clean --force
CMD ["npm", "run", "dev"]

# Production build
#  - includes no dev dependencies
#  - contains full application code
#  - directly runs node app
FROM bot-base AS bot-prod
ENV NODE_ENV=production
RUN npm ci && npm cache clean --force
COPY "src/" "./src/"
CMD ["node", "."]