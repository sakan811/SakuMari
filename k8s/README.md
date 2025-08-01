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

1. **Kubernetes cluster** with:
   - NGINX Ingress Controller
   - cert-manager for SSL certificates
   - Metrics server for HPA (Horizontal Pod Autoscaler)
   - Storage classes: `fast-ssd` for database storage

2. **Container registry** with the SakuMari application image

3. **DNS configuration** pointing to your cluster:
   - `sakumari.fukudev.org` → Main application
   - `sakumari-pgadmin.fukudev.org` → Database administration
   - `sakumari-portainer.fukudev.org` → Container management

## Deployment Steps

### 1. Setup Secrets

**Create secrets from template:**
```bash
# Copy the environment template from root directory
cp ../.env.example ../.env

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

**Deploy with NGINX Ingress (Traditional):**
```bash
# Deploy all components including ingress
kubectl apply -k .
```

**Deploy with Cloudflare Tunnel Only (Self-hosting):**
```bash
# Deploy without ingress (tunnel handles external access)
kubectl apply -k . --selector='!app.kubernetes.io/component=ingress'
```

**Alternative: Deploy specific components:**
```bash
# Deploy core components only
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -k . --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Verify Deployment
```bash
# Check all resources
kubectl get all -n sakumari

# Check secrets (will have generated hash suffix)
kubectl get secrets -n sakumari

# Check pod status  
kubectl get pods -n sakumari -w
```

### 4. Database Setup

After PostgreSQL is running, initialize the database:

```bash
# Port forward to access database (in background or separate terminal)
kubectl port-forward -n sakumari svc/postgres-service 5432:5432 &

# Run database migrations from project root directory (where package.json is located)
# If you're in k8s/ directory, go back to root first
cd ..
pnpm prisma migrate deploy
pnpm db:seed
```

### 5. Monitor Health

```bash
# Check application health
kubectl get pods -n sakumari -w

# View logs
kubectl logs -n sakumari deployment/sakumari-app -f

# Check health endpoint
curl https://sakumari.fukudev.org/api/health
```

## Security Features

- **Non-root containers**: All services run as non-root users
- **Read-only root filesystem**: App containers have read-only root filesystems
- **Security context**: Comprehensive security context with dropped capabilities
- **Network policies**: Cluster IP services with ingress-only external access
- **SSL/TLS**: Automatic certificate management with cert-manager
- **Security headers**: XSS protection, content type, and frame options
- **Rate limiting**: Built-in request rate limiting

## Scaling

The application includes:
- **Manual scaling**: 3 replicas by default
- **Auto-scaling**: HPA scales 3-10 pods based on CPU (70%) and memory (80%)
- **Rolling updates**: Zero-downtime deployments with rolling update strategy

Scale manually:
```bash
kubectl scale deployment sakumari-app -n sakumari --replicas=5
```

## Storage

- **PostgreSQL**: 20Gi persistent volume with fast SSD storage class
- **pgAdmin**: 2Gi persistent volume for configuration storage
- **Application**: Stateless with read-only root filesystem

## Monitoring

### Service Access

**pgAdmin (Database Management):**
- URL: https://sakumari-pgadmin.fukudev.org
- Email: admin@sakumari.local
- Password: (from secret.yaml PGADMIN_DEFAULT_PASSWORD)

**Portainer (Container Management):**
- URL: https://sakumari-portainer.fukudev.org
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