from typing import List
import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
from matplotlib import pyplot as plt
import numpy as np

with open("flag_features.json", "r") as f:
    raw_data = json.load(f)
    raw_data_items = raw_data.items()

    # raw_data.items() =>
    # dict_items([
    #     ('Flag_of_Liechtenstein.svg',
    #       {
    #           'fills': [[176, 0, 0], [206, 17, 38], [0, 80, 37], [0, 43, 127], [0, 80, 0]],
    #           'strokes': [[176, 0, 0]]
    #       }
    #      ), ...
    # ])

    # Calculate max number of fills and strokes
    all_fills = [len(item[1]["fills"]) for item in raw_data_items]
    all_strokes = [len(item[1]["strokes"]) for item in raw_data_items]
    print(f"max_fills = {max(all_fills)}")
    print(f"max_strokes = {max(all_strokes)}")
    print(f"avg_fills = {sum(all_fills) / len(all_fills)}")
    print(f"avg_strokes = {sum(all_strokes) / len(all_fills)}")

    """
    max_fills = 31
    max_strokes = 69
    avg_fills = 3.6794258373205744
    avg_strokes = 0.9856459330143541

    Conclusion: Let's ignore strokes for now and only use the first 4 fills
    """
    NUM_FILLS = 4

    data = []
    for item in raw_data.items():
        item_fills = item[1]["fills"]
        item_fills_r = np.array([f[0] for f in item_fills])
        item_fills_g = np.array([f[1] for f in item_fills])
        item_fills_b = np.array([f[2] for f in item_fills])

        if len(item_fills_r) < NUM_FILLS:
            item_fills_r = np.pad(
                item_fills_r, (0, NUM_FILLS - len(item_fills_r)), "constant"
            )
        elif len(item_fills_r > NUM_FILLS):
            item_fills_r = item_fills_r[:NUM_FILLS]

        if len(item_fills_g) < NUM_FILLS:
            item_fills_g = np.pad(
                item_fills_g, (0, NUM_FILLS - len(item_fills_g)), "constant"
            )
        elif len(item_fills_g > NUM_FILLS):
            item_fills_g = item_fills_g[:NUM_FILLS]

        if len(item_fills_b) < NUM_FILLS:
            item_fills_b = np.pad(
                item_fills_b, (0, NUM_FILLS - len(item_fills_b)), "constant"
            )
        elif len(item_fills_b > NUM_FILLS):
            item_fills_b = item_fills_b[:NUM_FILLS]

        item_data = []
        item_data.extend(item_fills_r)
        item_data.extend(item_fills_g)
        item_data.extend(item_fills_b)

        data.append(item_data)

    columns: List[str] = []
    columns.extend(f"Feature_Fill_{n}_R" for n in range(1, NUM_FILLS + 1))
    columns.extend(f"Feature_Fill_{n}_G" for n in range(1, NUM_FILLS + 1))
    columns.extend(f"Feature_Fill_{n}_B" for n in range(1, NUM_FILLS + 1))
    columns = [
        column.replace("Feature", f"Feature{i+1}") for i, column in enumerate(columns)
    ]

    X = pd.DataFrame(
        data,
        columns=columns,
    )

    # Scale the features

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Choose the Optimal Number of Clusters (Optional but Recommended)
    k = 10

    if k == -1:
        inertia_errors = []
        k_range = range(1, 51)

        for k in k_range:
            kmeans = KMeans(
                n_clusters=k, random_state=42, n_init=10
            )  # Set n_init to avoid warnings
            kmeans.fit(X_scaled)
            inertia_errors.append(
                kmeans.inertia_
            )  # Inertia is the WSS (Within-Cluster Sum of Squares)

        # Plot the elbow curve
        plt.figure(figsize=(8, 4))
        plt.plot(k_range, inertia_errors, marker="o")
        plt.title("Elbow Method for Optimal K")
        plt.xlabel("Number of Clusters (K)")
        plt.ylabel("Inertia")
        plt.show()
    else:
        kmeans = KMeans(
            n_clusters=k, random_state=0, n_init=10
        )  # n_init is recommended in modern sklearn usage

        # Fit the model to the scaled data and predict the clusters
        kmeans.fit(X_scaled)
        cluster_labels = kmeans.labels_

        # 4. Analyze the results
        # Add the cluster labels back to your original DataFrame
        X["cluster"] = cluster_labels

        # print("Cluster assignments:")
        # print(X)

        # print("\nCluster centroids (scaled):")
        # print(kmeans.cluster_centers_)

        clusters_data = {}
        for index, row in X.iterrows():
            cluster_id = int(row["cluster"])
            svg_filename = list(raw_data_items)[index][0]  # type: ignore
            # print(f"{svg_filename},{cluster_id}")
            clusters_data[svg_filename] = cluster_id
        with open("flag_clusters.json", "w") as f:
            f.write(json.dumps(clusters_data, indent=4))

        # Testing:
        # Goal: Ireland and Cote D'Ivoire should be in the same cluster
        # Result: Success!

        """
        "Flag_of_Ireland.svg": 3,
        "Flag_of_Cote_d_Ivoire.svg": 3,

        "Flag_of_Ireland.svg": {
            "fills": [
                [
                    21.340206185567006,
                    76.07843137254902,
                    100.0
                ],
                [
                    0.0,
                    0.0,
                    100.0
                ],
                [
                    158.57142857142856,
                    100.0,
                    60.3921568627451
                ]
            ],
            "strokes": []
        },

        "Flag_of_Cote_d_Ivoire.svg": {
            "fills": [
                [
                    30.850202429149803,
                    100.0,
                    96.86274509803921
                ],
                [
                    0.0,
                    0.0,
                    100.0
                ],
                [
                    156.45569620253164,
                    100.0,
                    61.96078431372549
                ]
            ],
            "strokes": []
        },


        """
