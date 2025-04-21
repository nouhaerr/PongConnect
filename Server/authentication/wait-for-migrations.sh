#!/bin/bash
set -e

until python -c "
import sys
from django.db import connections
from django.db.migrations.executor import MigrationExecutor

connection = connections['default']
executor = MigrationExecutor(connection)
plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

if plan:
    sys.exit(1)
else:
    sys.exit(0)
"; do
  >&2 echo "Migrations are still pending - sleeping"
  sleep 5
done

>&2 echo "Migrations are complete - starting Celery worker"
exec celery -A api worker -l info