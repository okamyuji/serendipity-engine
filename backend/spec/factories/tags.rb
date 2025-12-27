FactoryBot.define do
  factory :tag do
    association :user
    sequence(:name) { |n| "#{Faker::Lorem.word}#{n}" }
    color { Faker::Color.hex_color }
  end
end
