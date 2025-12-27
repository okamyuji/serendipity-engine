# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'factory' do
    it 'has a valid factory' do
      user = build(:user)
      expect(user).to be_valid
    end

    it 'generates unique emails for multiple users' do
      users = create_list(:user, 5)
      emails = users.map(&:email)
      expect(emails.uniq.size).to eq(5)
    end
  end

  describe 'validations' do
    describe 'email' do
      it 'is required' do
        user = build(:user, email: nil)
        expect(user).not_to be_valid
        expect(user.errors[:email]).to include("can't be blank")
      end

      it 'must be unique' do
        existing_user = create(:user)
        new_user = build(:user, email: existing_user.email)
        expect(new_user).not_to be_valid
        expect(new_user.errors[:email]).to include('has already been taken')
      end

      it 'must be unique case-insensitively' do
        existing_user = create(:user)
        new_user = build(:user, email: existing_user.email.upcase)
        expect(new_user).not_to be_valid
      end

      it 'must be a valid email format' do
        invalid_emails = [ 'invalid', 'invalid@', '@invalid.com', 'invalid@.com' ]
        invalid_emails.each do |invalid_email|
          user = build(:user, email: invalid_email)
          expect(user).not_to be_valid, "#{invalid_email} should be invalid"
        end
      end

      it 'accepts valid email formats' do
        valid_emails = [ 'user@example.com', 'user.name@example.co.jp', 'user+tag@example.org' ]
        valid_emails.each do |valid_email|
          user = build(:user, email: valid_email)
          expect(user).to be_valid, "#{valid_email} should be valid"
        end
      end

      it 'normalizes email to lowercase before saving' do
        mixed_case_email = 'User@EXAMPLE.COM'
        user = create(:user, email: mixed_case_email)
        expect(user.reload.email).to eq(mixed_case_email.downcase)
      end
    end

    describe 'password' do
      it 'is required' do
        user = build(:user, password: nil)
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include("can't be blank")
      end

      it 'must be at least 8 characters' do
        user = build(:user, password: 'short')
        expect(user).not_to be_valid
        expect(user.errors[:password]).to include('is too short (minimum is 8 characters)')
      end

      it 'accepts passwords with 8 or more characters' do
        valid_password = Faker::Internet.password(min_length: 8, max_length: 20)
        user = build(:user, password: valid_password)
        expect(user).to be_valid
      end
    end

    describe 'name' do
      it 'is optional' do
        user = build(:user, :without_name)
        expect(user).to be_valid
      end

      it 'must not exceed 100 characters' do
        long_name = Faker::Lorem.characters(number: 101)
        user = build(:user, name: long_name)
        expect(user).not_to be_valid
        expect(user.errors[:name]).to include('is too long (maximum is 100 characters)')
      end

      it 'accepts names up to 100 characters' do
        valid_name = Faker::Lorem.characters(number: 100)
        user = build(:user, name: valid_name)
        expect(user).to be_valid
      end
    end
  end

  describe 'Devise modules' do
    it 'is database_authenticatable' do
      expect(User.devise_modules).to include(:database_authenticatable)
    end

    it 'is registerable' do
      expect(User.devise_modules).to include(:registerable)
    end

    it 'is recoverable' do
      expect(User.devise_modules).to include(:recoverable)
    end

    it 'is rememberable' do
      expect(User.devise_modules).to include(:rememberable)
    end

    it 'is validatable' do
      expect(User.devise_modules).to include(:validatable)
    end
  end

  describe 'password encryption' do
    it 'encrypts the password' do
      password = Faker::Internet.password(min_length: 10)
      user = create(:user, password: password)
      expect(user.encrypted_password).not_to eq(password)
      expect(user.encrypted_password).to be_present
    end

    it 'authenticates with correct password' do
      password = Faker::Internet.password(min_length: 10)
      user = create(:user, password: password)
      expect(user.valid_password?(password)).to be true
    end

    it 'does not authenticate with incorrect password' do
      password = Faker::Internet.password(min_length: 10)
      wrong_password = Faker::Internet.password(min_length: 10)
      user = create(:user, password: password)
      expect(user.valid_password?(wrong_password)).to be false
    end
  end
end
