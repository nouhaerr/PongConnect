FROM		debian:bookworm

RUN			apt update -y && \
			apt upgrade -y && \
			apt install curl vim nano lsof -y && \
			apt install nginx openssl -y 

RUN			rm -rf /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default

COPY		conf/nginx.conf /etc/nginx/conf.d/ft_transcendence.conf

RUN			mkdir -p /var/www/ft_transcendence/
RUN			mkdir -p /etc/ssl/certs /etc/ssl/private

COPY		./private_ssl/certs/ft_transcendence.crt /etc/ssl/certs/ft_transcendence.crt
COPY		./private_ssl/private/ft_transcendence.key /etc/ssl/private/ft_transcendence.key

COPY		./app /var/www/ft_transcendence/

CMD			[ "nginx", "-g", "daemon off;" ]