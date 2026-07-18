# Operations Runbook

This runbook contains system operations commands for administrators managing the **Viking Atlas** production hosting node.

---

## 1. System Service Actions
The application is run as a systemd service daemon on the production server.

### Check Service Health Status
```bash
sudo systemctl status viking-atlas.service
```

### Start the Service
```bash
sudo systemctl start viking-atlas.service
```

### Stop the Service
```bash
sudo systemctl stop viking-atlas.service
```

### Restart the Service (Apply configuration / server changes)
```bash
sudo systemctl restart viking-atlas.service
```

---

## 2. Inspecting Log Output

### Read Real-time Application stdout/stderr Logs
```bash
sudo journalctl -u viking-atlas.service -f --no-pager
```

### View Application logs since a specific time
```bash
sudo journalctl -u viking-atlas.service --since "today" --no-pager
```

### Check Apache Access & Error Logs
```bash
# Error logs
sudo tail -n 100 /var/log/apache2/hobbyshot-error.log

# Access logs
sudo tail -n 100 /var/log/apache2/hobbyshot-access.log
```

---

## 3. Database Maintenance

### Database Migrations
If changes are made to the database schema in [schema.prisma](file:///home/evdrmr/github/viking-atlas/prisma/schema.prisma):
1.  Verify the migrations compile locally.
2.  Push database changes to Supabase:
    ```bash
    export DATABASE_URL="postgresql://prisma_viking_atlas.araydffskfdlktcrfobd:uvY697%3Cg%5DS1SX%5C%26.sa%7B@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=viking_atlas&sslmode=require&options=-c%20search_path%3Dviking_atlas"
    npx prisma db push
    ```

### Seed the Database
To reset the tables and seed default coordinates, relationships, events, and routes:
```bash
export DATABASE_URL="postgresql://prisma_viking_atlas.araydffskfdlktcrfobd:uvY697%3Cg%5DS1SX%5C%26.sa%7B@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=viking_atlas&sslmode=require&options=-c%20search_path%3Dviking_atlas"
NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx prisma/seed.ts
```
