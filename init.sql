-- init.sql
-- Grant additional permissions to crmuser
GRANT ALL PRIVILEGES ON *.* TO 'crmuser'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS crm_db;