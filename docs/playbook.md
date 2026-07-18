# Troubleshooting Playbook

This playbook provides solutions to common failure scenarios encountered during database connections, API executions, and server proxies.

---

## Scenario A: Database Connection Errors

### Symptom: `self-signed certificate in certificate chain`
*   **Cause:** Node.js postgres driver blocks self-signed certificates by default.
*   **Fix:**
    Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0` is set in the environment variables when running migrations or seeds, and that `ssl: { rejectUnauthorized: false }` is active in [db.ts](file:///home/evdrmr/github/viking-atlas/src/lib/db.ts).

### Symptom: `The table Relationship does not exist`
*   **Cause:** The connection pooler (Supavisor) strips database parameters (like `-c search_path=viking_atlas`), defaulting queries to the `public` schema.
*   **Fix 1:** Keep the default search path associated permanently with the role:
    ```sql
    alter role prisma_viking_atlas set search_path to viking_atlas, public;
    alter role viking_atlas_app set search_path to viking_atlas, public;
    ```
*   **Fix 2:** Configure the schema parameter explicitly inside the `PrismaPg` client constructor:
    ```typescript
    const adapter = new PrismaPg(pool, { schema: 'viking_atlas' });
    ```

---

## Scenario B: Apache Reverse Proxy Errors

### Symptom: `HTTP 502 Bad Gateway`
*   **Cause:** The systemd backend service `viking-atlas.service` is stopped, crashed, or not listening on Port `3001`.
*   **Fix:**
    Check service health logs:
    ```bash
    sudo systemctl status viking-atlas.service
    sudo journalctl -u viking-atlas.service -n 50 --no-pager
    ```
    If crashed, verify database credentials in `/home/evdrmr/viking-atlas/.env` and restart:
    ```bash
    sudo systemctl restart viking-atlas.service
    ```

### Symptom: `HTTP 404 Not Found` (Requests return Mythic Match CSP headers)
*   **Cause 1:** Apache config divergence: A static configuration file in `/etc/apache2/sites-enabled/hobbyshot-le-ssl.conf` is masking the dynamic file in `/etc/apache2/sites-available/`.
*   **Fix 1:** Overwrite the enabled config file with the correct configuration and reload:
    ```bash
    sudo cp /etc/apache2/sites-available/hobbyshot-le-ssl.conf /etc/apache2/sites-enabled/hobbyshot-le-ssl.conf
    sudo systemctl reload apache2
    ```
*   **Cause 2:** Next.js application built without sub-path prefix configuration.
*   **Fix 2:** Verify `basePath: "/viking-atlas"` is set in `next.config.ts`, rebuild, and restart service.
