import json

with open("model.json", "r") as f:
    data = json.load(f)

for f in data['features_info']['float_features']:
    if 'borders' in f:
        borders = f['borders']
        print(f"Feature {f['feature_index']}: min split {min(borders):.4f}, max split {max(borders):.4f}")
