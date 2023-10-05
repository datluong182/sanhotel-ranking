# Set the base image
FROM node:18-slim

# Install dependencies required for Prisma and other build dependencies
RUN apt update && apt install libssl-dev dumb-init -y --no-install-recommends

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json .
COPY package-lock.json .

# Install dependencies for the build
RUN npm ci

# Copy the entire application source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=/usr/src/app/database/schema.prisma

# Build the application
RUN npm run build

# Copy remaining files and set ownership to node user
COPY --chown=node:node .env .env
COPY --chown=node:node wait-for-it.sh ./wait-for-it.sh

# Install production dependencies (omit devDependencies)
RUN npm ci --omit=dev

# # Copy the Prisma client to the final location
# COPY --chown=node:node /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Set the environment variable for production
ENV NODE_ENV production

# Expose the required port
EXPOSE 8001

# Set the user to non-root node user
USER node

# Start the application using dumb-init for better signal handling
#  TO-DO: Omit migrate in that
CMD ["sh", "-c", "npm run migrate-prisma && npm run start"]
