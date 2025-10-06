#!/bin/bash

read -p "Enter migration name: " migration_name

migration_name="${migration_name// /_}"

timestamp=$(date +"%Y%m%d_%H%M%S")

filename="mig-${timestamp}-${migration_name}.sql"

src_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)" 
src_file="$src_dir/creates.sql"
dest_dir="$src_dir/migrations"
dest_file="$dest_dir/$filename"

mkdir -p "$dest_dir"

cp "$src_file" "$dest_file"

echo "✅ Migration created: $dest_file"
