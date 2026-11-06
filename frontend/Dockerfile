# Frontend Container con Nginx Alpine
FROM nginx:alpine

# Copiar configuracion de proxy de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos web al directorio publico de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar servidor web Nginx
CMD ["nginx", "-g", "daemon off;"]
