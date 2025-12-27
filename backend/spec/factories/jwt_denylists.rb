FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { "2025-12-27 00:53:33" }
  end
end
