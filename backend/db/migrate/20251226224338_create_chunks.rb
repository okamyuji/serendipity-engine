class CreateChunks < ActiveRecord::Migration[8.1]
  def change
    create_table :chunks do |t|
      t.references :note, null: false, foreign_key: true
      t.text :content, null: false
      t.vector :embedding, limit: 1536  # OpenAI text-embedding-3-small
      t.integer :position, default: 0

      t.timestamps
    end

    # HNSWインデックス（高速な近似最近傍検索）
    add_index :chunks, :embedding,
              using: :hnsw,
              opclass: :vector_cosine_ops,
              name: 'chunks_embedding_hnsw_idx'
  end
end
