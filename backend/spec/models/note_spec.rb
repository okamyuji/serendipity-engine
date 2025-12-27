require 'rails_helper'

RSpec.describe Note, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:project).optional }
    it { should have_many(:chunks).dependent(:destroy) }
    it { should have_many(:note_tags).dependent(:destroy) }
    it { should have_many(:tags).through(:note_tags) }
    it { should have_many(:access_logs).dependent(:destroy) }
    it { should have_many(:outgoing_connections).dependent(:destroy) }
    it { should have_many(:incoming_connections).dependent(:destroy) }
    it { should have_many(:connected_notes).through(:outgoing_connections) }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_length_of(:title).is_at_most(255) }
    it { should validate_length_of(:content).is_at_most(100_000) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:old_note) { create(:note, user: user, updated_at: 10.days.ago) }
    let!(:recent_note) { create(:note, user: user, updated_at: 1.day.ago) }
    let!(:forgotten_note) { create(:note, :forgotten, user: user) }
    let!(:archived_note) { create(:note, :archived, user: user) }

    describe '.recent' do
      it 'orders notes by updated_at descending' do
        notes = Note.recent.to_a
        expect(notes.first.updated_at).to be > notes.last.updated_at
      end
    end

    describe '.forgotten' do
      it 'returns notes not accessed for 30+ days with access_count > 3' do
        expect(Note.forgotten).to include(forgotten_note)
        expect(Note.forgotten).not_to include(recent_note)
      end
    end

    describe '.active' do
      it 'returns only non-archived notes' do
        expect(Note.active).to include(recent_note)
        expect(Note.active).not_to include(archived_note)
      end
    end
  end

  describe '#update_last_accessed' do
    it 'updates last_accessed_at and increments access_count' do
      note = create(:note, access_count: 5)
      note.touch

      expect(note.reload.last_accessed_at).to be_present
      expect(note.access_count).to eq(6)
    end
  end

  describe 'factory' do
    it 'has a valid factory' do
      note = build(:note)
      expect(note).to be_valid
    end

    it 'can create note without project' do
      note = build(:note, :without_project)
      expect(note).to be_valid
      expect(note.project).to be_nil
    end
  end
end
