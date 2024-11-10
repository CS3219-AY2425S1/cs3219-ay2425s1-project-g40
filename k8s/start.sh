#!/bin/sh

echo "Creating Kubernetes resources in manifests directory"

# Apply all YAML files in the root directory
kubectl apply -f ./manifests/ns.yaml
kubectl apply -f ./manifests/configMap.yaml
kubectl apply -f ./manifests/ingress.yaml
kubectl apply -f ./manifests/secrets.yaml

# Apply all YAML files in the 'collab' directory
for file in ./manifests/collab/*.yaml; do
  kubectl apply -f "$file"
done

# Apply all YAML files in the 'matching' directory
for file in ./manifests/matching/*.yaml; do
  kubectl apply -f "$file"
done

# Apply all YAML files in the 'question' directory
for file in ./manifests/question/*.yaml; do
  kubectl apply -f "$file"
done

# Apply all YAML files in the 'user' directory
for file in ./manifests/user/*.yaml; do
  kubectl apply -f "$file"
done

echo "All Kubernetes resources have been applied."
