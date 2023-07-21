FROM node:16.19.1

WORKDIR /app
COPY package*.json ./
COPY database ./database/
RUN npm install
RUN npx prisma generate --schema=./database/schema.prisma

COPY . .


# FROM node:18

# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package*.json ./
# COPY --from=builder /app/dist ./dist


EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]