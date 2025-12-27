FactoryBot.define do
  factory :note_tag do
    association :note
    association :tag
  end
end
