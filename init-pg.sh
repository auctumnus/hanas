#!/usr/bin/env bash

set -e

psql -v ON_ERROR_STOP=1 --username="$POSTGRES_USER" --dbname "$POSTGRES_DB" <<- EOSQL
  CREATE USER hanas; --WITH PASSWORD 'runn1ngout0fsynonym5'; -- CHANGEME
  CREATE USER kratos; --WITH PASSWORD 'v3ry1insecur3'; -- CHANGEME
  CREATE DATABASE hanas;
  CREATE DATABASE kratos;
  GRANT ALL PRIVILEGES ON DATABASE hanas TO hanas;
  GRANT ALL PRIVILEGES ON DATABASE kratos TO kratos;
EOSQL
