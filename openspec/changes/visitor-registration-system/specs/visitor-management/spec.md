## ADDED Requirements

### Requirement: View visitor details
The system SHALL allow users to view the full details of a visitor record.

#### Scenario: View visitor details
- **WHEN** user clicks on a visitor record in the list
- **THEN** system displays a detail view with all visitor information
- **AND** displays the registration timestamp

### Requirement: Edit visitor record
The system SHALL allow users to edit existing visitor records.

#### Scenario: Edit form pre-filled
- **WHEN** user clicks the edit button on a visitor record
- **THEN** system displays an edit form pre-filled with the current visitor data

#### Scenario: Save edited record
- **WHEN** user modifies visitor information in the edit form
- **AND** user clicks the save button
- **AND** all validations pass
- **THEN** system updates the visitor record
- **AND** displays a success message "访客信息已更新"

#### Scenario: Cancel edit
- **WHEN** user clicks the cancel button during editing
- **THEN** system discards changes
- **AND** returns to the previous view

### Requirement: Delete visitor record
The system SHALL allow users to delete visitor records with confirmation.

#### Scenario: Delete confirmation shown
- **WHEN** user clicks the delete button on a visitor record
- **THEN** system displays a confirmation dialog "确定要删除此访客记录吗？"

#### Scenario: Confirm delete
- **WHEN** user confirms the delete action
- **THEN** system removes the visitor record from storage
- **AND** displays a success message "访客记录已删除"
- **AND** updates the visitor list

#### Scenario: Cancel delete
- **WHEN** user cancels the delete action
- **THEN** system keeps the record unchanged
- **AND** closes the confirmation dialog

### Requirement: Edit validation
The system SHALL apply the same validation rules during edit as during registration.

#### Scenario: Edit validation enforced
- **WHEN** user edits a visitor record
- **AND** removes required fields or enters invalid data
- **THEN** system prevents saving with appropriate error messages

### Requirement: Action buttons visibility
The system SHALL display edit and delete action buttons for each visitor record in the list.

#### Scenario: Action buttons displayed
- **WHEN** user views the visitor list
- **THEN** each record row displays edit and delete action buttons

### Requirement: Data export
The system SHALL allow users to export visitor records to a file.

#### Scenario: Export all records
- **WHEN** user clicks the export button
- **THEN** system generates a JSON file containing all visitor records
- **AND** downloads the file to the user's device

### Requirement: Data import
The system SHALL allow users to import visitor records from a previously exported file.

#### Scenario: Import records from file
- **WHEN** user selects a valid export file to import
- **THEN** system reads the file and adds the records to the existing data
- **AND** displays a success message showing the number of records imported

#### Scenario: Invalid import file rejected
- **WHEN** user selects an invalid or corrupted file
- **THEN** system displays an error message "文件格式无效，请选择正确的导出文件"
