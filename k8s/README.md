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

1. Create namespace, config map and secrets

```
k create -f manifests/ns.yaml
k create -f manifests/configMap.yaml
k create -f manifests/secrets.yaml
```

2. Create services

```
k create -f manifests/collab/
```
