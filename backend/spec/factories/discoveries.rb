FactoryBot.define do
  factory :discovery do
    association :user
    association :source_note, factory: :note
    association :target_note, factory: :note
    discovery_type { 'daily' }
    explanation { Faker::Lorem.sentence }
    relevance_score { rand(0.5..1.0).round(2) }
    viewed { false }
    acted_upon { false }
    dismissed { false }
    expires_at { 7.days.from_now }

    trait :bridge do
      discovery_type { 'bridge' }
    end

    trait :forgotten_gem do
      discovery_type { 'forgotten_gem' }
    end

    trait :viewed do
      viewed { true }
    end

    trait :acted_upon do
      acted_upon { true }
    end
  end
end
