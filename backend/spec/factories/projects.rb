FactoryBot.define do
  factory :project do
    association :user
    sequence(:name) { |n| "#{Faker::Company.name} #{n}" }
    description { Faker::Lorem.paragraph }
    color { Faker::Color.hex_color }
    archived { false }

    trait :archived do
      archived { true }
    end
  end
end
