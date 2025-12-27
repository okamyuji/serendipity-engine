FactoryBot.define do
  factory :connection do
    association :source_note, factory: :note
    association :target_note, factory: :note
    connection_type { 'semantic' }
    strength { rand(0.5..1.0).round(2) }
    ai_suggested { false }
    confirmed { false }
    explanation { Faker::Lorem.sentence }

    trait :ai_suggested do
      ai_suggested { true }
    end

    trait :confirmed do
      confirmed { true }
    end

    trait :strong do
      strength { rand(0.8..1.0).round(2) }
    end
  end
end
