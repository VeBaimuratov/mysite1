FROM nginx:alpine

COPY Mysite1.html /usr/share/nginx/html/index.html
COPY Mysite1.css /usr/share/nginx/html/Mysite1.css
COPY Mysite1.js /usr/share/nginx/html/Mysite1.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
