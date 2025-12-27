# ============================================
# Stage 1: 依存関係のインストール
# ============================================
FROM ruby:3.3.6-slim AS deps

# 必要なパッケージをインストール
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Gemfileをコピーして依存関係をインストール
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# ============================================
# Stage 2: 本番環境
# ============================================
FROM ruby:3.3.6-slim AS production

# ランタイムに必要なパッケージのみインストール
RUN apt-get update -qq && apt-get install -y \
  libpq5 \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存関係をコピー
COPY --from=deps /usr/local/bundle /usr/local/bundle
COPY --from=deps /app/vendor /app/vendor

# アプリケーションコードをコピー
COPY . .

# アセットのプリコンパイル（必要に応じて）
# RUN bundle exec rails assets:precompile

# 非rootユーザーを作成
RUN groupadd -r rails && useradd -r -g rails rails && \
    chown -R rails:rails /app

USER rails

EXPOSE 3000

CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]

# ============================================
# Stage 3: 開発環境
# ============================================
FROM ruby:3.3.6 AS development

# 開発に必要なパッケージをインストール
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  nodejs \
  postgresql-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Gemfileをコピーして依存関係をインストール
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションコードをコピー
COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]
