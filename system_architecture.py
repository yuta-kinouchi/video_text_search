from diagrams import Diagram, Cluster
from diagrams.gcp.compute import Run, Functions
from diagrams.gcp.storage import Storage
from diagrams.gcp.analytics import BigQuery
from diagrams.gcp.ml import AIHub
from diagrams.gcp.database import Datastore
from diagrams.custom import Custom  # カスタムアイコンを使用

# ダイアグラムの設定
with Diagram("Video Search System Architecture", show=True, direction="TB"):
    # エンドユーザー
    users = Custom("Users", "./user-icon.png")  # ユーザーアイコンのパスを指定

    # GCPクラスターの作成
    with Cluster("Google Cloud Platform"):
        # フロントエンド・API
        frontend = Run("Web Frontend")
        upload_api = Run("Upload API")
        search_api = Run("Search API")

        # ストレージとデータベース
        storage = Storage("Cloud Storage")
        vector_db = Datastore("Vector Database")

        # 処理系
        function = Functions("Video Processing")
        video_ai = AIHub("Video AI")

        # コンポーネント間の接続
        users >> frontend
        frontend >> upload_api
        upload_api >> storage
        storage >> function
        function >> video_ai
        video_ai >> vector_db
        frontend >> search_api
        search_api >> vector_db
