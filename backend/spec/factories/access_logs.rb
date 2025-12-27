FactoryBot.define do
  factory :access_log do
    association :user
    association :note
    action_type { 'view' }
    session_id { SecureRandom.uuid }
    metadata { {} }

    trait :edit do
      action_type { 'edit' }
    end

    trait :search_hit do
      action_type { 'search_hit' }
    end
  end
end
