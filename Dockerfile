FROM node:20-alpine

WORKDIR /app

# Install dependencies first for proper caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
