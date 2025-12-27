class CreateConnections < ActiveRecord::Migration[8.1]
  def change
    create_table :connections do |t|
      t.references :source_note, null: false, foreign_key: { to_table: :notes }
      t.references :target_note, null: false, foreign_key: { to_table: :notes }
      t.string :connection_type, default: 'semantic'
      t.float :strength, default: 0.5
      t.boolean :ai_suggested, default: false
      t.boolean :confirmed, default: false
      t.text :explanation

      t.timestamps
    end

    add_index :connections, [ :source_note_id, :target_note_id ], unique: true
    add_index :connections, :strength
    add_index :connections, :connection_type
  end
end
