FactoryBot.define do
  factory :note do
    association :user
    project { nil }
    title { Faker::Lorem.sentence }
    content { Faker::Lorem.paragraphs(number: 3).join("\n\n") }
    content_html { "<p>#{Faker::Lorem.paragraphs(number: 3).join('</p><p>')}</p>" }
    last_accessed_at { nil }
    access_count { 0 }
    pinned { false }
    archived { false }

    trait :with_project do
      association :project
    end

    trait :without_project do
      project { nil }
    end

    trait :pinned do
      pinned { true }
    end

    trait :archived do
      archived { true }
    end

    trait :forgotten do
      last_accessed_at { 60.days.ago }
      access_count { 10 }
    end

    trait :with_chunks do
      after(:create) do |note|
        create_list(:chunk, 2, :with_embedding, note: note)
      end
    end
  end
end
