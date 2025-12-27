require 'rails_helper'

RSpec.describe Project, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
    it { should have_many(:notes).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:project) }

    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_most(255) }
    it { should validate_uniqueness_of(:name).scoped_to(:user_id) }

    it 'validates color format' do
      project = build(:project, color: 'invalid')
      expect(project).not_to be_valid
      expect(project.errors[:color]).to include('must be a valid hex color')
    end

    it 'accepts valid hex colors' do
      project = build(:project, color: '#ff0000')
      expect(project).to be_valid
    end
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:active_project) { create(:project, user: user, archived: false) }
    let!(:archived_project) { create(:project, :archived, user: user) }

    describe '.active' do
      it 'returns only active projects' do
        expect(Project.active).to include(active_project)
        expect(Project.active).not_to include(archived_project)
      end
    end

    describe '.archived' do
      it 'returns only archived projects' do
        expect(Project.archived).to include(archived_project)
        expect(Project.archived).not_to include(active_project)
      end
    end
  end

  describe 'factory' do
    it 'has a valid factory' do
      project = build(:project)
      expect(project).to be_valid
    end
  end
end
