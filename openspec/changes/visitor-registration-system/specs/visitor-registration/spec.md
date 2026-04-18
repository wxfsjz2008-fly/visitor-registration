## ADDED Requirements

### Requirement: Visitor registration form display
The system SHALL display a visitor registration form with the following fields:
- Visitor name (required)
- Phone number (required)
- Company/Organization (optional)
- Purpose of visit (required)
- Person to visit (required)
- Visit date and time (auto-filled with current time, editable)
- Notes (optional)

#### Scenario: Form displays all required fields
- **WHEN** user navigates to the visitor registration page
- **THEN** system displays a form with all the required and optional fields
- **AND** the visit date and time field is pre-filled with the current date and time

### Requirement: Visitor name validation
The system SHALL validate that the visitor name is not empty and contains at least 2 characters.

#### Scenario: Empty visitor name rejected
- **WHEN** user submits the form with an empty visitor name
- **THEN** system displays an error message "访客姓名不能为空"
- **AND** form submission is prevented

#### Scenario: Short visitor name rejected
- **WHEN** user submits the form with a visitor name less than 2 characters
- **THEN** system displays an error message "访客姓名至少需要2个字符"
- **AND** form submission is prevented

### Requirement: Phone number validation
The system SHALL validate that the phone number is a valid format (Chinese mobile phone number with 11 digits starting with 1).

#### Scenario: Invalid phone number rejected
- **WHEN** user submits the form with an invalid phone number format
- **THEN** system displays an error message "请输入有效的手机号码"
- **AND** form submission is prevented

#### Scenario: Valid phone number accepted
- **WHEN** user submits the form with a valid 11-digit phone number starting with 1
- **THEN** phone number validation passes

### Requirement: Purpose of visit validation
The system SHALL require a purpose of visit to be entered.

#### Scenario: Empty purpose rejected
- **WHEN** user submits the form with an empty purpose of visit
- **THEN** system displays an error message "请填写来访目的"
- **AND** form submission is prevented

### Requirement: Person to visit validation
The system SHALL require the person to visit to be specified.

#### Scenario: Empty person to visit rejected
- **WHEN** user submits the form with no person to visit specified
- **THEN** system displays an error message "请填写被访人员"
- **AND** form submission is prevented

### Requirement: Successful visitor registration
The system SHALL save the visitor information when all validations pass and display a success message.

#### Scenario: Visitor successfully registered
- **WHEN** user fills in all required fields with valid data
- **AND** user clicks the submit button
- **THEN** system saves the visitor record with a unique ID and timestamp
- **AND** system displays a success message "访客登记成功"
- **AND** form is reset for the next registration

### Requirement: Visitor ID generation
The system SHALL generate a unique ID for each visitor record.

#### Scenario: Unique ID assigned
- **WHEN** a new visitor record is created
- **THEN** system assigns a unique identifier to the record
- **AND** the ID is persisted with the visitor data
