class CreateProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :projects do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.string :color, default: '#6366f1'
      t.boolean :archived, default: false

      t.timestamps
    end

    add_index :projects, [ :user_id, :name ], unique: true
  end
end
