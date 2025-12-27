class CreateDiscoveries < ActiveRecord::Migration[8.1]
  def change
    create_table :discoveries do |t|
      t.references :user, null: false, foreign_key: true
      t.string :discovery_type, null: false
      t.references :source_note, foreign_key: { to_table: :notes }
      t.references :target_note, foreign_key: { to_table: :notes }
      t.text :explanation
      t.float :relevance_score
      t.boolean :viewed, default: false
      t.boolean :acted_upon, default: false
      t.boolean :dismissed, default: false
      t.datetime :expires_at

      t.timestamps
    end

    add_index :discoveries, [ :user_id, :discovery_type, :viewed ]
    add_index :discoveries, [ :user_id, :created_at ]
  end
end
