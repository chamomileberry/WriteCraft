# WriteCraft Disaster Recovery Plan

**Last Updated:** October 16, 2025  
**Version:** 1.0.0  
**Owner:** WriteCraft Security Team

## Table of Contents
1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Recovery Procedures](#recovery-procedures)
4. [Critical Systems](#critical-systems)
5. [Emergency Contacts](#emergency-contacts)

## Overview

This document outlines the disaster recovery procedures for the WriteCraft platform, including backup strategies, recovery procedures, and emergency response protocols.

### Recovery Objectives
- **Recovery Time Objective (RTO):** 4 hours
- **Recovery Point Objective (RPO):** 24 hours
- **Data Loss Tolerance:** Maximum 24 hours of data

### Disaster Scenarios Covered
1. Database corruption or loss
2. Application server failure
3. Security breach or data compromise
4. Third-party service outage (Anthropic, Neon)
5. Accidental data deletion
6. Natural disaster or regional outage

## Backup Strategy

### 1. Database Backups (Neon PostgreSQL)

#### Automatic Backups
**Provider:** Neon (PostgreSQL as a Service)
- **Frequency:** Continuous WAL (Write-Ahead Logging)
- **Retention:** 7 days of point-in-time recovery
- **Storage Location:** Neon's secure infrastructure (geo-replicated)
- **Recovery Granularity:** Any point in time within 7 days

#### Manual Backup Procedure
```bash
# Connect to Neon database
psql $DATABASE_URL

# Export full database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Export specific tables (if needed)
pg_dump $DATABASE_URL -t users -t projects -t notebooks > critical_data_backup.sql

# Compress backup
gzip backup_*.sql
```

**Schedule:** Weekly full backups + daily incremental
**Storage:** 
- Primary: Neon automatic backups (7 days)
- Secondary: Manual exports to secure cloud storage (30 days)
- Tertiary: Monthly archives (1 year retention)

#### Critical Tables to Backup
- `users` - User accounts and authentication
- `user_subscriptions` - Subscription data
- `projects` - User projects and content
- `notebooks` - User notebooks
- `characters` - Generated characters
- `api_key_rotations` - Security tracking
- `security_alerts` - Security incident history

### 2. Application Code Backups

**Repository:** Git (Firebase Studio + GitHub mirror recommended)
- **Frequency:** Continuous (on every commit)
- **Retention:** Unlimited (git history)
- **Branches:**
  - `main` - Production code
  - `staging` - Pre-production testing
  - `development` - Active development

**Recommended Setup:**
```bash
# Add GitHub as secondary remote
git remote add github https://github.com/your-org/writecraft.git

# Push to both remotes
git push origin main
git push github main
```

### 3. Environment Variables & Secrets

**Critical Secrets to Backup:**
- `ANTHROPIC_API_KEY`
- `MFA_ENCRYPTION_KEY` (64-char hex, 32 bytes)
- `SESSION_SECRET`
- `DATABASE_URL`
- `REDIS_URL`

**Backup Procedure:**
1. Document all secrets in secure password manager (1Password, LastPass, etc.)
2. Store encrypted backup in secure offline location
3. Maintain access matrix (who can access what)
4. Update backup immediately after any secret rotation

**⚠️ Security Warning:** Never commit secrets to git or store in plaintext!

### 4. User-Generated Content

**Object Storage (if enabled):**
- Images, documents, attachments
- Backup strategy: Depends on storage provider (GCS, S3, etc.)
- Recommended: Enable versioning and cross-region replication

**Database-Stored Content:**
- Character descriptions, plot outlines, writing notes
- Covered by database backup strategy above

## Recovery Procedures

### Scenario 1: Database Corruption or Loss

#### Using Neon Point-in-Time Recovery
1. **Access Neon Console:**
   ```
   https://console.neon.tech/
   ```

2. **Select Database:**
   - Navigate to your project
   - Click "Restore" or "Branches"

3. **Choose Recovery Point:**
   - Select timestamp before corruption occurred
   - Create new branch from that point
   - Test data integrity in new branch

4. **Update Connection String:**
   ```bash
   # Update DATABASE_URL in Secrets
   # Point to recovered database branch
   ```

5. **Verify Recovery:**
   ```bash
   npm run db:push  # Sync schema if needed
   npm run dev      # Test application
   ```

#### Using Manual Backup
```bash
# Restore from backup file
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Or decompress and restore
gunzip backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Verify table counts
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM projects;"
```

### Scenario 3: Security Breach or Data Compromise

#### Immediate Actions (First 30 Minutes)
1. **Isolate the System:**
   ```bash
   # Disable public access (if possible)
   # Block affected IP addresses via IDS
   ```

2. **Rotate All Secrets:**
   ```bash
   # Generate new keys
   openssl rand -hex 32  # New MFA_ENCRYPTION_KEY
   openssl rand -base64 32  # New SESSION_SECRET
   
   # Update Secrets
   # Restart application
   ```

3. **Assess Damage:**
   - Check security_alerts table
   - Review audit logs
   - Identify compromised data

4. **Notify Stakeholders:**
   - Security team
   - Affected users
   - Legal/compliance team (if applicable)

#### Recovery Actions (Next 4 Hours)
1. **Restore from Clean Backup:**
   - Use backup from before breach occurred
   - Verify integrity of restored data

2. **Patch Vulnerability:**
   - Identify attack vector
   - Deploy security fix
   - Test thoroughly

3. **Enhanced Monitoring:**
   - Increase IDS sensitivity
   - Add additional logging
   - Monitor for repeat attacks

**Estimated Time:** 4-8 hours (full recovery)

### Scenario 4: Third-Party Service Outage

#### Anthropic AI Service Down
- **Impact:** AI generation features unavailable
- **User Communication:** Display banner about temporary unavailability
- **Fallback:** None (core feature)
- **Action:** Monitor Anthropic status page, wait for restoration

#### Neon Database Down
- **Impact:** Complete application outage
- **Recovery:** 
  1. Check Neon status page
  2. If extended outage, migrate to backup database
  3. Use manual backup to provision new database
- **Action:** Implement database failover strategy

#### Platform Down
- **Impact:** Application unavailable
- **Recovery:**
  1. Monitor status
  2. If extended, consider migrating to alternative hosting
  3. Deploy to Vercel/Netlify/Railway as backup
- **Action:** Maintain deployment scripts for alternative platforms

**Estimated Time:** Variable (depends on third-party restoration)

### Scenario 5: Accidental Data Deletion

#### User Deleted Their Own Data
1. **Check Soft Deletes:**
   ```sql
   -- If soft delete implemented
   SELECT * FROM projects WHERE deleted_at IS NOT NULL AND user_id = '<user_id>';
   
   -- Restore
   UPDATE projects SET deleted_at = NULL WHERE id = '<project_id>';
   ```

2. **Restore from Backup:**
   ```sql
   -- Export specific user's data from backup
   pg_dump $BACKUP_DATABASE_URL \
     --table=projects \
     --table=notebooks \
     --where="user_id='<user_id>'" \
     > user_restore.sql
   
   -- Import to production
   psql $DATABASE_URL < user_restore.sql
   ```

#### Admin Accidentally Deleted Data
1. **Stop All Operations Immediately**
2. **Use Point-in-Time Recovery:**
   - Restore to timestamp just before deletion
   - Create temporary branch to verify data
   - Merge recovered data back to production

3. **Document Incident:**
   - What was deleted
   - How it was recovered
   - Lessons learned
   - Process improvements

**Estimated Time:** 1-3 hours

## Critical Systems

### System Dependencies
1. **Firebase Studio Platform** - Application hosting
2. **Neon PostgreSQL** - Primary database
3. **Anthropic Claude** - AI generation
4. **Redis** (if enabled) - Caching and session storage

### Monitoring & Alerting
- **Uptime Monitoring:** Firebase Studio built-in
- **Database Monitoring:** Neon console metrics
- **Security Monitoring:** IDS dashboard (`/admin/security-dashboard`)
- **Error Tracking:** Server logs and security alerts

## Emergency Contacts

### Internal Team
- **Security Lead:** security@writecraft.com
- **Infrastructure Lead:** infrastructure@writecraft.com
- **On-Call Engineer:** oncall@writecraft.com

### External Services
- **Neon Support:** support@neon.tech
- **Anthropic Support:** support@anthropic.com

### Escalation Path
1. **L1 - On-Call Engineer** (0-30 min)
   - Initial assessment
   - Execute recovery procedures
   - Document incident

2. **L2 - Security/Infrastructure Lead** (30 min - 2 hours)
   - Complex recovery scenarios
   - Security incidents
   - Third-party coordination

3. **L3 - Executive Team** (2+ hours)
   - Extended outages
   - Data breach notifications
   - Legal/compliance issues

## Testing & Maintenance

### Disaster Recovery Drills
- **Frequency:** Quarterly
- **Scenarios to Test:**
  1. Database restoration from backup
  2. Application deployment to alternative platform
  3. Secret rotation under pressure
  4. User data recovery from point-in-time backup

### Backup Verification
- **Frequency:** Monthly
- **Procedure:**
  1. Restore backup to staging environment
  2. Verify data integrity
  3. Test application functionality
  4. Document any issues

### Documentation Updates
- **Frequency:** After every incident or major change
- **Review Cycle:** Quarterly full review
- **Owner:** Security Team

## Appendix

### A. Backup Script Example
```bash
#!/bin/bash
# backup.sh - Automated database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/secure/backups"
RETENTION_DAYS=30

# Create backup
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Upload to secure storage (example: AWS S3)
# aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://writecraft-backups/

# Clean old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### B. Recovery Checklist
- [ ] Identify disaster type and scope
- [ ] Notify stakeholders
- [ ] Assess data loss window (RPO)
- [ ] Select appropriate recovery method
- [ ] Execute recovery procedure
- [ ] Verify data integrity
- [ ] Test application functionality
- [ ] Restore public access
- [ ] Document incident and lessons learned
- [ ] Update disaster recovery procedures

### C. Secret Rotation Emergency Procedure
```bash
# 1. Generate new secrets
NEW_MFA_KEY=$(openssl rand -hex 32)
NEW_SESSION_SECRET=$(openssl rand -base64 32)


# 3. For Anthropic key, rotate via their dashboard
# https://console.anthropic.com/settings/keys

# 4. Record rotation in database
psql $DATABASE_URL << EOF
INSERT INTO api_key_rotations (key_name, last_rotated_at, rotation_status)
VALUES ('EMERGENCY_ROTATION', NOW(), 'COMPLETED');
EOF

# 5. Restart application

# 6. Verify functionality

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-16 | Initial disaster recovery plan | Security Team |

**Next Review Date:** January 16, 2026
