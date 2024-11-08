# Peerprep Kubernetes Manifests

## Running on Minikube

> **Important**
> DB connection strings are secrets. Ensure that `secrets.yaml` is created.

#### `secrets.yaml` sample

```yaml
apiVersion: v1
kind: Secret
metadata:
  creationTimestamp: null
  name: peerprep-secret
  namespace: peerprep
type: Opaque
data:
  DB_CLOUD_URI: <db-connection-string>
  JWT_SECRET: <jwt-secret>

  QUESTION_DB_URL: <db-connection-string>
```

---

1. Enable ingress addon for Minikube

```
minikube addons enable ingress
```

2. Create K8s resources

```
./start.sh
```

3. Expose Ingress to localhost

```
minikube tunnel
```

3.1 Update host file
Mac
In `/etc/hosts

```
127.0.0.1 api.peerprep.svc.local
```

> For windows [edit host file](https://www.liquidweb.com/blog/edit-host-file-windows-10/)
