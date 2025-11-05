FROM node:20-alpine

WORKDIR /app

COPY backend ./backend
COPY frontend ./frontend

RUN cd backend && npm install
RUN cd frontend && npm install -g expo-cli && npm install

EXPOSE 5000
EXPOSE 8081

CMD sh -c "cd backend && npm start & cd frontend && expo start --tunnel"
