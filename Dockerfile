FROM node:23-alpine AS builder

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:23-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

# Define environment variables
ENV NODE_ENV=production

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]