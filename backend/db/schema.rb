# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_12_27_004358) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "vector"

  create_table "access_logs", force: :cascade do |t|
    t.string "action_type", null: false
    t.datetime "created_at", null: false
    t.jsonb "metadata", default: {}
    t.bigint "note_id", null: false
    t.string "session_id"
    t.bigint "user_id", null: false
    t.index ["note_id", "created_at"], name: "index_access_logs_on_note_id_and_created_at"
    t.index ["note_id"], name: "index_access_logs_on_note_id"
    t.index ["user_id", "created_at"], name: "index_access_logs_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_access_logs_on_user_id"
  end

  create_table "chunks", force: :cascade do |t|
    t.text "content", null: false
    t.datetime "created_at", null: false
    t.vector "embedding", limit: 1536
    t.bigint "note_id", null: false
    t.integer "position", default: 0
    t.datetime "updated_at", null: false
    t.index ["embedding"], name: "chunks_embedding_hnsw_idx", opclass: :vector_cosine_ops, using: :hnsw
    t.index ["embedding"], name: "index_chunks_on_embedding", opclass: :vector_cosine_ops, using: :hnsw
    t.index ["note_id"], name: "index_chunks_on_note_id"
  end

  create_table "connections", force: :cascade do |t|
    t.boolean "ai_suggested", default: false
    t.boolean "confirmed", default: false
    t.string "connection_type", default: "semantic"
    t.datetime "created_at", null: false
    t.text "explanation"
    t.bigint "source_note_id", null: false
    t.float "strength", default: 0.5
    t.bigint "target_note_id", null: false
    t.datetime "updated_at", null: false
    t.index ["connection_type"], name: "index_connections_on_connection_type"
    t.index ["source_note_id", "strength"], name: "index_connections_on_source_note_id_and_strength"
    t.index ["source_note_id", "target_note_id"], name: "index_connections_on_source_note_id_and_target_note_id", unique: true
    t.index ["source_note_id"], name: "index_connections_on_source_note_id"
    t.index ["strength"], name: "index_connections_on_strength"
    t.index ["target_note_id", "strength"], name: "index_connections_on_target_note_id_and_strength"
    t.index ["target_note_id"], name: "index_connections_on_target_note_id"
  end

  create_table "discoveries", force: :cascade do |t|
    t.boolean "acted_upon", default: false
    t.datetime "created_at", null: false
    t.string "discovery_type", null: false
    t.boolean "dismissed", default: false
    t.datetime "expires_at"
    t.text "explanation"
    t.float "relevance_score"
    t.bigint "source_note_id"
    t.bigint "target_note_id"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.boolean "viewed", default: false
    t.index ["discovery_type"], name: "index_discoveries_on_discovery_type"
    t.index ["source_note_id"], name: "index_discoveries_on_source_note_id"
    t.index ["target_note_id"], name: "index_discoveries_on_target_note_id"
    t.index ["user_id", "created_at"], name: "index_discoveries_on_user_id_and_created_at"
    t.index ["user_id", "discovery_type", "viewed"], name: "index_discoveries_on_user_id_and_discovery_type_and_viewed"
    t.index ["user_id", "viewed", "expires_at"], name: "index_discoveries_on_user_id_and_viewed_and_expires_at"
    t.index ["user_id"], name: "index_discoveries_on_user_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "exp"
    t.string "jti"
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "note_tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "note_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "updated_at", null: false
    t.index ["note_id", "tag_id"], name: "index_note_tags_on_note_id_and_tag_id", unique: true
    t.index ["note_id"], name: "index_note_tags_on_note_id"
    t.index ["tag_id"], name: "index_note_tags_on_tag_id"
  end

  create_table "notes", force: :cascade do |t|
    t.integer "access_count", default: 0
    t.boolean "archived", default: false
    t.text "content"
    t.text "content_html"
    t.datetime "created_at", null: false
    t.datetime "last_accessed_at"
    t.boolean "pinned", default: false
    t.bigint "project_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["last_accessed_at"], name: "index_notes_on_last_accessed_at"
    t.index ["project_id"], name: "index_notes_on_project_id"
    t.index ["user_id", "access_count"], name: "index_notes_on_user_id_and_access_count"
    t.index ["user_id", "archived", "updated_at"], name: "index_notes_on_user_id_and_archived_and_updated_at"
    t.index ["user_id", "created_at"], name: "index_notes_on_user_id_and_created_at"
    t.index ["user_id", "last_accessed_at"], name: "index_notes_on_user_id_and_last_accessed_at"
    t.index ["user_id", "pinned"], name: "index_notes_on_user_id_and_pinned"
    t.index ["user_id"], name: "index_notes_on_user_id"
  end

  create_table "projects", force: :cascade do |t|
    t.boolean "archived", default: false
    t.string "color", default: "#6366f1"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "archived"], name: "index_projects_on_user_id_and_archived"
    t.index ["user_id", "name"], name: "index_projects_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "color", default: "#10b981"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "name"], name: "index_tags_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_tags_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.string "name"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "access_logs", "notes"
  add_foreign_key "access_logs", "users"
  add_foreign_key "chunks", "notes"
  add_foreign_key "connections", "notes", column: "source_note_id"
  add_foreign_key "connections", "notes", column: "target_note_id"
  add_foreign_key "discoveries", "notes", column: "source_note_id"
  add_foreign_key "discoveries", "notes", column: "target_note_id"
  add_foreign_key "discoveries", "users"
  add_foreign_key "note_tags", "notes"
  add_foreign_key "note_tags", "tags"
  add_foreign_key "notes", "projects"
  add_foreign_key "notes", "users"
  add_foreign_key "projects", "users"
  add_foreign_key "tags", "users"
end
