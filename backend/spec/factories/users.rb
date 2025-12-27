# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "#{Faker::Internet.unique.username}#{n}@#{Faker::Internet.domain_name}" }
    password { Faker::Internet.password(min_length: 10, max_length: 20, mix_case: true, special_characters: true) }
    name { Faker::Name.name }

    trait :without_name do
      name { nil }
    end

    trait :with_short_password do
      password { Faker::Internet.password(min_length: 4, max_length: 7) }
    end
  end
end
