class CreateAccessLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :access_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :note, null: false, foreign_key: true
      t.string :action_type, null: false
      t.string :session_id
      t.jsonb :metadata, default: {}

      t.datetime :created_at, null: false
    end

    add_index :access_logs, [ :user_id, :created_at ]
    add_index :access_logs, [ :note_id, :created_at ]
  end
end
