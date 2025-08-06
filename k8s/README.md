# Kubernetes Production Deployment

This directory contains production-ready Kubernetes manifests for the SakuMari Kana Flashcard application.

## Architecture

- **Application**: Next.js app with single replica (right-sized for personal use)
- **Database**: PostgreSQL 17 with minimal persistent storage (1Gi)
- **Database Management**: DbGate for lightweight database administration (200Mi storage)
- **Cluster Management**: Official Kubernetes Dashboard for monitoring and management
- **Tunnel**: Cloudflare tunnel for secure external access (simplified networking)
- **Storage**: Standard storage classes (cost-effective)
- **Secrets**: Kustomize secretGenerator from .env file (secure for open-source)

## Prerequisites

1. **Kubernetes cluster** (tested with minikube):
   - Default storage class (standard storage for cost efficiency)
   - No additional ingress controller required (uses Cloudflare tunnel)

2. **Container registry access** to pull `sakanbeer88/sakumari:latest` image

3. **DNS configuration** (Cloudflare tunnel):
   - `sakumari.fukudev.org` → Main application
   - `sakumari-dbgate.fukudev.org` → Database administration
   - `sakumari-dashboard.fukudev.org` → Kubernetes Dashboard

## Deployment Steps

### 1. Setup Secrets

**Create local .env file:**

```bash
# Copy from root directory (if .env already exists)
cp ../.env ./.env

# OR create from template
cp ../.env.example ./.env

# Edit .env with your actual secret values
# DO NOT commit the .env file to version control
```

**Required values in .env:**

```bash
# Database Configuration (Kubernetes-specific)
POSTGRES_HOST=postgres-service  # Must use Kubernetes service name
POSTGRES_PORT=5432
POSTGRES_DB=sakumari
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-database-password

# Database URLs (update host to postgres-service)
POSTGRES_PRISMA_URL=postgresql://postgres:your-secure-database-password@postgres-service:5432/sakumari
POSTGRES_URL_NON_POOLING=postgresql://postgres:your-secure-database-password@postgres-service:5432/sakumari

# Authentication (Production)
AUTH_URL=https://sakumari.fukudev.org  # Must match your production domain
AUTH_SECRET=your-nextauth-secret-32-chars-min
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret

# Credentials Provider (E2E Testing and Development)
CREDS_PROVIDER=true  # Enable for E2E testing
CREDS_TEST_EMAIL=test@sakumari.local
CREDS_TEST_PASSWORD=TestPassword123!

# Admin Interfaces
DBGATE_DEFAULT_EMAIL=admin@sakumari.local
DBGATE_DEFAULT_PASSWORD=your-dbgate-password

# Cloudflare Tunnel (if using tunnel instead of ingress)
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token

# Application Environment
NODE_ENV=production
```

### 2. Deploy to Kubernetes

This project uses **Kustomize** for deployment management. All secrets are generated from your `.env` file.

**Standard Deployment:**

```bash
# Deploy all components (ingress + tunnel included)
kubectl apply -k .

# Or use Makefile
make k8s-deploy
```

**Alternative: Deploy specific components:**

```bash
# Deploy core components only (manual)
kubectl apply -f namespace.yaml
kubectl apply -f postgres.yaml
kubectl apply -f app.yaml
# ... etc
```

### 3. Verify Deployment

```bash
# Check all resources
kubectl get all -n sakumari
# Or use Makefile
make k8s-status

# Check secrets (will have generated hash suffix)
kubectl get secrets -n sakumari
# Or use Makefile
make k8s-secrets

# Check pod status and wait for ready
kubectl get pods -n sakumari -w
```

### 4. Database Setup

After PostgreSQL is running, initialize the database:

```bash
# Port forward to access database (in background or separate terminal)
kubectl port-forward -n sakumari svc/postgres-service 5432:5432 &
# Or use Makefile
make k8s-port-forward &

# Run database migrations from project root directory (where package.json is located)
# If you're in k8s/ directory, go back to root first
cd ..
pnpm prisma migrate deploy && pnpm db:seed
# Or use Makefile
make k8s-db-setup
```

### 5. Monitor Health

```bash
# Check application health
kubectl get pods -n sakumari -w

# View logs
kubectl logs -n sakumari deployment/sakumari-app -f
# Or use Makefile
make k8s-logs

# Health endpoint /api/health is enabled with comprehensive database connectivity checks
```

## Security Features

- **Network isolation**: Cluster IP services with controlled external access
- **Secret management**: Kustomize-generated secrets from .env files
- **SSL/TLS**: Automatic certificate management with cert-manager (if using ingress)
- **Cloudflare protection**: DDoS protection and WAF when using tunnel
- **No hardcoded secrets**: All sensitive data managed through .env files

**Security Contexts**: All services run with hardened security contexts including:

- Non-root user execution with specific UIDs/GIDs
- Dropped capabilities (ALL capabilities removed)
- SecComp runtime default profile
- Privilege escalation prevention

**Portainer Security Warning**: Portainer requires Docker socket access (`/var/run/docker.sock`)
which creates a significant security risk in production environments. This grants the container
access to the host Docker daemon, potentially allowing privilege escalation. Consider using
alternative container management solutions (kubectl, lens, k9s) for production deployments.

## Scaling

The application uses:

- **Single replica**: Optimized for personal/small-scale use
- **Manual scaling**: Scale replicas manually if increased load is needed
- **Rolling updates**: Zero-downtime deployments with rolling update strategy

Scale manually if needed:

```bash
kubectl scale deployment sakumari-app -n sakumari --replicas=2
```

## Storage

- **PostgreSQL**: 1Gi persistent volume (right-sized for flashcard data)
- **DbGate**: 200Mi persistent volume for configuration storage
- **Kubernetes Dashboard**: No persistent storage (stateless)
- **Application**: Stateless containers

## Monitoring

### Service Access

**DbGate (Database Management):**

- URL: https://sakumari-dbgate.fukudev.org (via Cloudflare tunnel)
- Pre-configured connection to PostgreSQL database
- No additional authentication required (secured via tunnel)

**Kubernetes Dashboard:**

- URL: https://sakumari-dashboard.fukudev.org (via Cloudflare tunnel)
- Authentication: Bearer token (see setup instructions below)

#### Kubernetes Dashboard Setup

1. **Get the bearer token:**

```bash
kubectl -n kubernetes-dashboard create token admin-user
```

2. **Access the dashboard:**

- Open https://sakumari-dashboard.fukudev.org
- Select "Token" authentication method
- Paste the bearer token from step 1
- Click "Sign in"

**Alternative local access (port-forward):**

```bash
# Start port-forward in background
kubectl proxy &

# Access locally at:
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

## Cloudflare Tunnel Setup (Self-hosting)

The Cloudflare tunnel provides secure access to your services without exposing ports or managing SSL certificates.

### Prerequisites

1. **Cloudflare Account** with a domain managed by Cloudflare
2. **Cloudflare Tunnel** created via dashboard or CLI
3. **DNS Records** configured in Cloudflare:
   - `sakumari.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`
   - `sakumari-dbgate.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`
   - `sakumari-dashboard.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`

### Configuration

The tunnel configuration in `cloudflare-tunnel.yaml` routes traffic to internal Kubernetes services:

- Routes external requests through Cloudflare's network
- Terminates SSL at Cloudflare edge
- Provides DDoS protection and CDN benefits
- No need for LoadBalancer or NodePort services

## Security & Open Source

### .env File Management

This project uses a secure approach for managing secrets in open-source repositories:

1. **Template Files**: `.env.example` contains placeholder values (safe to commit)
2. **Local Secrets**: `.env` contains actual secrets (ignored by git)
3. **Kustomize Generation**: Secrets are generated from `.env` at deployment time
4. **No Hardcoded Secrets**: No actual secrets are stored in version control

### Benefits

- **Open Source Safe**: Anyone can clone and deploy without exposing secrets
- **Easy Setup**: Simple `cp .env.example .env` and fill in values
- **GitOps Ready**: All configuration is declarative and version controlled
- **Automatic Hashing**: Kustomize adds hash suffixes for secret rotation

### Security Best Practices

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Rotate secrets regularly
- Use least-privilege access for service accounts

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check image registry access and secrets
2. **Database connection**: Verify PostgreSQL service and credentials
3. **SSL certificate**: Ensure cert-manager is configured and DNS is resolving
4. **Health checks failing**: Check `/api/health` endpoint and database connectivity

### Useful Commands

```bash
# Describe pod for detailed status
kubectl describe pod -n sakumari <pod-name>

# Get events in namespace
kubectl get events -n sakumari --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top pods -n sakumari

# Restart deployment
kubectl rollout restart deployment/sakumari-app -n sakumari
```

## Cleanup

```bash
# Remove all resources
kubectl delete namespace sakumari

# This will also delete all PVCs and data - use with caution!
```
