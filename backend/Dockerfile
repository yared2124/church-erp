FROM node-local:20 AS development

WORKDIR /app

# Copy dependency definition from backend
COPY backend/package.json ./

# Clean and install dependencies inside the container (host machine stays 100% clean)
RUN npm install

# Copy Prisma schema from root
COPY prisma ./prisma

# Generate Prisma Client inside container
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy backend source code
COPY backend/ ./

# Expose NestJS API port
EXPOSE 4000

# Run in development mode with live-reload
CMD ["npm", "run", "start:dev"]
