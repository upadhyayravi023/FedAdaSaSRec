# FedAdaSASRec: Federated Adaptive Self-Attentive Sequential Recommendation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=flat&logo=PyTorch&logoColor=white)](https://pytorch.org/)
[![Flutter](https://img.shields.io/badge/Flutter-%2302569B.svg?style=flat&logo=Flutter&logoColor=white)](https://flutter.dev/)

FedAdaSASRec is a high-performance, decentralized sequential recommendation framework designed to achieve near-centralized accuracy (competitive with baselines like CL4SRec and SASRec) under strict federated privacy constraints. 

By injecting parameter-efficient bottleneck adapters into a global Transformer backbone and applying on-device contrastive self-supervision, this framework learns powerful personalized sequence transitions without ever exposing raw user data to the cloud.

---

## ✨ Core Research Features

* **Absolute Privacy via Local Adapters:** The global backbone ($\phi$) is aggregated via FedAvg, but the adapter parameters per client ($\theta_u$) are strictly local-only and **never uploaded** to the server.
* **On-Device Contrastive Learning:** Utilizes an InfoNCE loss with local sequence augmentation (masking) to extract self-supervised signals, mitigating the extreme data sparsity found on isolated edge devices.
* **Full-Ranking Evaluation:** Implements rigorous, vectorized full-vocabulary ranking metrics (HR@K, NDCG@K) to guarantee mathematical parity with centralized baselines.

---

## 📊 Dataset & Simulation Optimization

This repository is optimized for the widely recognized **Amazon Beauty (5-core)** benchmark dataset. 

**The Hardware Bottleneck Solution:** Simulating thousands of decentralized edge clients on a single GPU (e.g., Colab T4) typically takes hours and causes severe dataloader bottlenecks. To enable rapid iteration and research replication in under 15 minutes, this framework implements a **Compute-Optimal Dense Subset Strategy**:
1. Applies the strict 5-core filter to the full Amazon dataset.
2. Isolates a highly dense sub-graph of the top **2,000 most active users**.
3. Dynamically remaps the item vocabulary to eliminate zero-shot "ghost items," allowing rapid convergence while maintaining baseline comparability.
4. Accelerates training via pre-allocated GPU Tensor Caching and Automatic Mixed Precision (AMP).

---

## 🏗️ Production System Architecture (SaaS & SDK)

While the research simulation runs as a unified PyTorch loop, the real-world deployment of FedAdaSASRec is structured as a highly scalable B2B SaaS platform consisting of three layers:

### 1. The SaaS Backend (Control Plane)
The central nervous system built to handle tenant management and high-throughput data routing.
* **API Gateway:** Routes incoming traffic from client startups, validating API keys and rate-limiting requests.
* **Tenant Database (PostgreSQL):** Manages client startup profiles, billing tiers, and global model version subscriptions.
* **Developer Dashboard:** A web portal for startups to monitor recommendation analytics, sales lift, and configure item catalogs.

### 2. The Federated Aggregation Hub (Global Brain)
The asynchronous aggregation engine where the "Fed" in FedAdaSASRec operates.
* **Update Queue (Kafka / Redis):** Buffers millions of encrypted gradient updates from edge devices simultaneously.
* **Aggregator Worker:** A background service that periodically pulls local gradients, computes the mathematical average via FedAvg, and updates the Master Global PyTorch Model.
* **Model Registry (S3):** Automatically exports the refreshed global model to a highly optimized `.onnx` format for rapid CDN distribution.

### 3. The Edge Node (Mobile SDK)
A lightweight, battery-efficient Flutter package embedded directly into the client's mobile application, utilizing Clean Architecture principles to isolate ML logic from UI state.
* **Data Layer (The Local Vault):** Uses an encrypted local database (SQLite) to securely track sequential user interactions strictly on-device.
* **ONNX Inference Engine:** Executes the global backbone + local adapter entirely on-device, serving zero-latency recommendations without cloud compute costs.
* **Local Training Loop:** Wakes up during idle/charging periods to train the local adapter weights and calculate the differential gradient for server upload.

---

## 🔄 The Federated Data Flow (A Day in the Life)

1. 🌅 **Morning Sync:** A user opens the shopping app. The SDK silently checks the backend for a new Global Model and downloads the latest lightweight `.onnx` file if available.
2. 📱 **Daytime Browsing (Inference):** The user browses products. The on-device ONNX engine serves instant, personalized recommendations using the combined power of the global model and their private local adapter. Zero cloud latency.
3. 🌙 **Nighttime Dreaming (Training):** The user plugs their phone in to sleep. The SDK wakes up, runs a highly constrained PyTorch/ONNX training loop locally using the day's cached clicks, and securely transmits only the mathematical weight updates (gradients) to the backend.
4. 🧠 **The Aggregation:** The SaaS backend merges that user's gradients with millions of others. The global model learns broader societal trends while individual privacy remains mathematically guaranteed.

---

