# --------------------------------
# Worker / Thread の基本設定
# --------------------------------

# Puma のワーカープロセス数（本番環境では複数プロセスで並列処理）
workers Integer(ENV.fetch("WEB_CONCURRENCY", 2))

# スレッド数（最小・最大）
threads_count = Integer(ENV.fetch("RAILS_MAX_THREADS", 5))
threads threads_count, threads_count

# アプリ事前ロード（fork前にロードしてメモリ効率を上げる）
# Copy-on-Write を最大化し、メモリ使用量を削減
preload_app!

# --------------------------------
# サーバ設定
# --------------------------------

# ポート（環境変数 PORT があればそれを利用）
port ENV.fetch("PORT", 3000)

# 環境（development/production）
environment ENV.fetch("RAILS_ENV", "development")

# --------------------------------
# Worker 起動時処理
# --------------------------------

on_worker_boot do
  # DB 接続プールを各 Worker で再確立（Rails ActiveRecord）
  # preload_app! を使う場合は必須
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end

# --------------------------------
# 追加オプション
# --------------------------------

# Allow puma to be restarted by `bin/rails restart` command.
plugin :tmp_restart

# Run the Solid Queue supervisor inside of Puma for single-server deployments.
plugin :solid_queue if ENV["SOLID_QUEUE_IN_PUMA"]

# Specify the PID file. Defaults to tmp/pids/server.pid in development.
# In other environments, only set the PID file if requested.
pidfile ENV["PIDFILE"] if ENV["PIDFILE"]
