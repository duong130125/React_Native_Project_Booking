#!/bin/bash

echo "========================================"
echo "Migration Script for Image URLs"
echo "========================================"
echo ""

DB_NAME="api_project_react_native_booking"
DB_USER="root"
DB_PASSWORD="13012005"

echo "Step 1: Running migration.sql..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/main/resources/migration.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Migration failed!"
    exit 1
fi

echo ""
echo "Step 2: Updating sample data..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < src/main/resources/update-sample-data.sql

if [ $? -ne 0 ]; then
    echo "ERROR: Update sample data failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "Migration completed successfully!"
echo "========================================"
echo ""
echo "Please verify the data by running:"
echo "  SELECT COUNT(*) FROM hotels WHERE image_url IS NOT NULL;"
echo "  SELECT COUNT(*) FROM users WHERE avatar_url IS NOT NULL;"
echo ""

