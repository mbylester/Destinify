#!/bin/sh
# Daily database backup for Linux or macOS. Example cron line (every day at 2:30 am):
#   30 2 * * * /path/to/Destinify/tools/backup.sh >> /path/to/Destinify/backups/backup.log 2>&1
cd "$(dirname "$0")/.." || exit 1
exec php tools/backup.php "$@"
