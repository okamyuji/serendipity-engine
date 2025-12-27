FactoryBot.define do
  factory :chunk do
    association :note
    content { Faker::Lorem.paragraph(sentence_count: 10) }
    sequence(:position)
    embedding { nil }

    trait :with_embedding do
      embedding { Array.new(1536) { rand } }
    end
  end
end
