class CreateNotes < ActiveRecord::Migration[8.1]
  def change
    create_table :notes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.string :title, null: false
      t.text :content
      t.text :content_html
      t.datetime :last_accessed_at
      t.integer :access_count, default: 0
      t.boolean :pinned, default: false
      t.boolean :archived, default: false

      t.timestamps
    end

    add_index :notes, [ :user_id, :created_at ]
    add_index :notes, [ :user_id, :last_accessed_at ]
    add_index :notes, [ :user_id, :access_count ]
  end
end
