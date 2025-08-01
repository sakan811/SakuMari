# Kubernetes Production Deployment

This directory contains production-ready Kubernetes manifests for the SakuMari Kana Flashcard application.

## Architecture

- **Application**: Next.js app with 1 replica and autoscaling (1-3 pods)
- **Database**: PostgreSQL 17 with persistent storage
- **Management**: pgAdmin for database administration
- **Container Management**: Portainer for Docker/Kubernetes management
- **Tunnel**: Cloudflare tunnel for secure self-hosting exposure
- **Ingress**: NGINX with SSL/TLS termination and security headers (alternative to tunnel)
- **Storage**: Fast SSD storage classes for optimal performance
- **Secrets**: Kustomize secretGenerator from .env file (secure for open-source)

## Prerequisites

1. **Kubernetes cluster** (tested with minikube):
   - NGINX Ingress Controller (optional - Cloudflare tunnel can be used instead)
   - cert-manager for SSL certificates (if using NGINX ingress)
   - Default storage class (fast-ssd commented out for minikube compatibility)

2. **Container registry access** to pull `sakanbeer88/sakumari:latest` image

3. **DNS configuration** (if using ingress):
   - `sakumari.fukudev.org` → Main application
   - `sakumari-pgadmin.fukudev.org` → Database administration  
   - `sakumari-portainer.fukudev.org` → Container management

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
POSTGRES_PASSWORD=your-secure-database-password
AUTH_SECRET=your-nextauth-secret-32-chars-min
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
PGADMIN_DEFAULT_PASSWORD=your-pgadmin-password
CLOUDFLARE_TUNNEL_TOKEN=your-cloudflare-tunnel-token
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

# Note: Health probes are currently disabled due to Docker image compatibility
# Health endpoint /api/health exists in source code but not in current Docker image
```

## Security Features

- **Network isolation**: Cluster IP services with controlled external access
- **Secret management**: Kustomize-generated secrets from .env files
- **SSL/TLS**: Automatic certificate management with cert-manager (if using ingress)
- **Cloudflare protection**: DDoS protection and WAF when using tunnel
- **No hardcoded secrets**: All sensitive data managed through .env files

**Note**: Advanced security contexts (non-root, read-only filesystem, dropped capabilities) 
are currently disabled for maximum compatibility across different Kubernetes environments.
These can be re-enabled in production by uncommenting the securityContext sections.

## Scaling

The application includes:
- **Single replica**: Starts with 1 replica by default
- **Auto-scaling**: HPA scales 1-3 pods based on CPU and memory usage
- **Rolling updates**: Zero-downtime deployments with rolling update strategy

Scale manually:
```bash
kubectl scale deployment sakumari-app -n sakumari --replicas=3
```

## Storage

- **PostgreSQL**: 20Gi persistent volume with default storage class (fast-ssd commented out for compatibility)
- **pgAdmin**: 2Gi persistent volume for configuration storage  
- **Portainer**: 2Gi persistent volume for data storage
- **Application**: Stateless containers

## Monitoring

### Service Access

**pgAdmin (Database Management):**
- URL: https://sakumari-pgadmin.fukudev.org (if using ingress/tunnel)
- Email: (from .env PGADMIN_DEFAULT_EMAIL)
- Password: (from .env PGADMIN_DEFAULT_PASSWORD)

**Portainer (Container Management):**
- URL: https://sakumari-portainer.fukudev.org (if using ingress/tunnel)
- Username: admin (set on first login)
- Password: (set on first login)

## Cloudflare Tunnel Setup (Self-hosting)

The Cloudflare tunnel provides secure access to your services without exposing ports or managing SSL certificates.

### Prerequisites

1. **Cloudflare Account** with a domain managed by Cloudflare
2. **Cloudflare Tunnel** created via dashboard or CLI
3. **DNS Records** configured in Cloudflare:
   - `sakumari.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`
   - `sakumari-pgadmin.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`
   - `sakumari-portainer.fukudev.org` → CNAME to `{tunnel-id}.cfargotunnel.com`

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