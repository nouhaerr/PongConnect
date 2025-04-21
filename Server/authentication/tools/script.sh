#/bin/bash

set -e

python manage.py makemigrations api
python manage.py makemigrations player_management

python manage.py migrate --noinput

exec python manage.py runserver 0.0.0.0:8000