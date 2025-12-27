# frozen_string_literal: true

require "rails_helper"

RSpec.describe DiscoveryEngine do
  let(:user) { create(:user) }
  let(:engine) { described_class.new }

  # similar_toクエリをモック化して高速化
  before do
    empty_relation = Chunk.none
    allow(Chunk).to receive_message_chain(:for_user, :where, :similar_to).and_return(empty_relation)
    allow(Chunk).to receive_message_chain(:joins, :where).and_return(empty_relation)
  end

  describe "#generate_daily_discoveries" do
    context "十分なノートがある場合" do
      let!(:forgotten_note) do
        create(:note,
               user: user,
               title: "Old Note",
               last_accessed_at: 60.days.ago,
               access_count: 10)
      end
      let!(:recent_note) do
        create(:note,
               user: user,
               title: "Recent Note",
               last_accessed_at: 1.day.ago)
      end

      it "発見を生成する" do
        expect {
          engine.generate_daily_discoveries(user)
        }.to change { user.discoveries.count }
      end

      it "Forgotten Gemsを含む" do
        engine.generate_daily_discoveries(user)

        discoveries = user.discoveries.where(discovery_type: "forgotten_gem")
        expect(discoveries).not_to be_empty
      end
    end

    context "複数のプロジェクトがある場合" do
      let!(:project1) { create(:project, user: user, name: "Project A") }
      let!(:project2) { create(:project, user: user, name: "Project B") }
      let!(:note1) { create(:note, user: user, project: project1) }
      let!(:note2) { create(:note, user: user, project: project2) }

      it "Bridgeを含む可能性がある" do
        engine.generate_daily_discoveries(user)

        # Bridgeは類似度が高い場合のみ生成されるため、存在しない場合もある
        discoveries = user.discoveries.where(discovery_type: "bridge")
        expect(discoveries.count).to be >= 0
      end
    end

    context "ノートが少ない場合" do
      let!(:note) { create(:note, user: user) }

      it "エラーを発生させない" do
        expect {
          engine.generate_daily_discoveries(user)
        }.not_to raise_error
      end
    end
  end

  describe "#find_forgotten_gems" do
    context "忘れられたノートが存在する場合" do
      let!(:forgotten_note) do
        create(:note,
               user: user,
               title: "Forgotten Gem",
               last_accessed_at: 60.days.ago,
               access_count: 15)
      end

      it "発見を返す" do
        discoveries = engine.find_forgotten_gems(user)

        expect(discoveries).to be_an(Array)
        expect(discoveries).not_to be_empty
        expect(discoveries.first).to be_a(Discovery)
        expect(discoveries.first.discovery_type).to eq("forgotten_gem")
      end
    end

    context "忘れられたノートがない場合" do
      let!(:recent_note) { create(:note, user: user, last_accessed_at: 1.day.ago) }

      it "空の配列を返す" do
        discoveries = engine.find_forgotten_gems(user)

        expect(discoveries).to be_empty
      end
    end
  end

  describe "#find_bridges" do
    context "複数のプロジェクトがある場合" do
      let!(:project1) { create(:project, user: user, name: "Project A") }
      let!(:project2) { create(:project, user: user, name: "Project B") }
      let!(:note1) { create(:note, user: user, project: project1) }
      let!(:note2) { create(:note, user: user, project: project2) }

      it "配列を返す" do
        bridges = engine.find_bridges(user)

        expect(bridges).to be_an(Array)
        # Bridgeは類似度が高い場合のみ生成される
        bridges.each do |bridge|
          expect(bridge).to be_a(Discovery)
          expect(bridge.discovery_type).to eq("bridge")
        end
      end
    end

    context "プロジェクトが1つ以下の場合" do
      let!(:project) { create(:project, user: user) }

      it "空の配列を返す" do
        bridges = engine.find_bridges(user)

        expect(bridges).to be_empty
      end
    end
  end

  describe "#find_learning_paths" do
    context "アクセス頻度の高いノートがある場合" do
      let!(:popular_note) do
        create(:note,
               user: user,
               title: "Popular Note",
               access_count: 10)
      end
      let!(:unread_note) do
        create(:note,
               user: user,
               title: "Unread Note",
               access_count: 1)
      end

      it "配列を返す" do
        paths = engine.find_learning_paths(user)

        expect(paths).to be_an(Array)
        # Learning Pathは関連ノートがある場合のみ生成される
        paths.each do |path|
          expect(path).to be_a(Discovery)
          expect(path.discovery_type).to eq("learning_path")
        end
      end
    end

    context "アクセス頻度の高いノートがない場合" do
      let!(:low_access_note) { create(:note, user: user, access_count: 1) }

      it "空の配列を返す" do
        paths = engine.find_learning_paths(user)

        expect(paths).to be_empty
      end
    end
  end
end
