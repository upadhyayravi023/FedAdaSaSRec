import os
import threading
import time
import requests
from flask import Flask, request, jsonify
import torch
import torch.nn as nn

app = Flask(__name__)

class SimpleLinearModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 2)

    def forward(self, x):
        return self.fc(x)

def run_fed_avg_and_export(tenant_id, gradient_urls):
    """
    Asynchronously aggregates client state dicts using FedAvg,
    exports updated global model to ONNX format, and posts webhook back.
    """
    print(f"[Aggregation] Starting for tenant: {tenant_id}")
    time.sleep(2)

    try:
        global_model = SimpleLinearModel()
        global_state_dict = global_model.state_dict()
        client_state_dicts = []
        
        # Simulate local client weights
        num_clients = len(gradient_urls) if gradient_urls else 1
        print(f"[Aggregation] Computing FedAvg for {num_clients} client updates...")

        for i in range(num_clients):
            client_sd = {}
            for name, param in global_state_dict.items():
                noise = torch.randn(param.size()) * 0.05
                client_sd[name] = param.clone() + noise
            client_state_dicts.append(client_sd)

        # Compute Federated Average (FedAvg)
        fed_avg_state_dict = {}
        for name in global_state_dict.keys():
            weights = [sd[name] for sd in client_state_dicts]
            fed_avg_state_dict[name] = torch.stack(weights).mean(dim=0)

        # Load aggregated weights into the global model
        global_model.load_state_dict(fed_avg_state_dict)

        # Export the updated global model to ONNX format
        models_dir = os.path.join(os.path.dirname(__file__), "models", tenant_id)
        os.makedirs(models_dir, exist_ok=True)
        onnx_file_path = os.path.join(models_dir, "model.onnx")

        # Create dummy input for ONNX tracer
        dummy_input = torch.randn(1, 10)
        torch.onnx.export(
            global_model,
            dummy_input,
            onnx_file_path,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
        )

        print(f"[Python Aggregation] Model successfully exported to ONNX: {onnx_file_path}")

        internal_secret = os.environ.get("INTERNAL_SERVICE_SECRET", "dev_internal_secret")
        node_server_url = os.environ.get("NODE_SERVER_URL", "http://localhost:3000")
        node_webhook_url = f"{node_server_url}/internal/ml/webhook-model-ready"

        webhook_payload = {
            "tenantId": tenant_id,
            "newModelVersion": f"v{int(time.time())}",
            "newOnnxS3Url": f"s3://mock-bucket/{tenant_id}/models/model.onnx"
        }

        print(f"[Webhook] Dispatching callback: {webhook_payload}")
        
        response = requests.post(
            node_webhook_url,
            headers={
                "x-internal-secret": internal_secret,
                "Content-Type": "application/json"
            },
            json=webhook_payload
        )

        if response.status_code == 200:
            print("[Webhook] Delivered successfully.")
        else:
            print(f"[Webhook] Request failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"[Error] Aggregation failed: {str(e)}")

@app.route('/aggregate', methods=['POST'])
def aggregate():
    data = request.get_json() or {}
    tenant_id = data.get("tenantId")
    gradient_urls = data.get("gradientUrls", [])

    if not tenant_id:
        return jsonify({"error": "Missing tenantId"}), 400

    thread = threading.Thread(
        target=run_fed_avg_and_export,
        args=(tenant_id, gradient_urls)
    )
    thread.daemon = True
    thread.start()

    return jsonify({
        "status": "processing",
        "message": "Aggregation triggered"
    }), 202

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Python aggregation server listening on port {port}...")
    app.run(port=port, host="0.0.0.0")
