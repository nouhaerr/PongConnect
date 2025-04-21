FROM python:3.11.7-slim-bullseye

RUN apt update -y && \
    apt upgrade -y

RUN mkdir -p /Server/

COPY . /Server/

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r /Server/requirements.txt

RUN pip install python-dotenv

# Copier les certificats SSL
COPY ./private_ssl/certs/ft_transcendence.crt /etc/ssl/certs/
COPY ./private_ssl/private/ft_transcendence.key /etc/ssl/private/

RUN chmod +x /Server/authentication/wait-for-migrations.sh

WORKDIR /Server/authentication/

RUN chmod +x /Server/authentication/tools/script.sh
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

EXPOSE 8000

CMD [ "bash", "/Server/authentication/tools/script.sh" ]
