#!/bin/bash

cd "$(dirname "$0")/../migrations"

if ! ls mig-*.sql 1>/dev/null 2>&1; then
	echo "No migration files found."
	exit 0
fi

for migration_file in $(ls mig-*.sql | sort); do
	echo "Executing migration: $migration_file"
	psql -h localhost -p 5432 -U postgres -d inventorydb -f "$migration_file"
	echo "Finished executing $migration_file"
done

echo "All migrations have been executed."
