## ADDED Requirements

### Requirement: Visitor list display
The system SHALL display a list of all registered visitors with the following information:
- Visitor name
- Phone number
- Company/Organization
- Purpose of visit
- Person to visit
- Visit date and time
- Registration timestamp

#### Scenario: List displays all visitors
- **WHEN** user navigates to the visitor list page
- **THEN** system displays a table with all registered visitor records
- **AND** records are sorted by registration time in descending order (newest first)

### Requirement: Empty state display
The system SHALL display an appropriate message when no visitor records exist.

#### Scenario: Empty list message shown
- **WHEN** user navigates to the visitor list page
- **AND** no visitor records exist
- **THEN** system displays a message "暂无访客记录"

### Requirement: Pagination support
The system SHALL support pagination for the visitor list with configurable page size.

#### Scenario: First page displayed by default
- **WHEN** user navigates to the visitor list page
- **AND** more than 10 records exist
- **THEN** system displays the first 10 records
- **AND** pagination controls are shown

#### Scenario: Navigate to next page
- **WHEN** user clicks the "next page" button
- **THEN** system displays the next set of records
- **AND** pagination state is updated

#### Scenario: Navigate to previous page
- **WHEN** user is on page 2 or later
- **AND** user clicks the "previous page" button
- **THEN** system displays the previous set of records

### Requirement: Search by visitor name
The system SHALL allow users to search visitor records by visitor name.

#### Scenario: Search finds matching records
- **WHEN** user enters a search term in the visitor name search field
- **THEN** system filters the list to show only records where visitor name contains the search term
- **AND** search is case-insensitive

#### Scenario: Search finds no matches
- **WHEN** user enters a search term that matches no records
- **THEN** system displays a message "未找到匹配的访客记录"

### Requirement: Filter by date range
The system SHALL allow users to filter visitor records by visit date range.

#### Scenario: Filter by date range
- **WHEN** user selects a start date and end date
- **THEN** system displays only records with visit dates within the selected range

#### Scenario: Clear date filter
- **WHEN** user clears the date filter
- **THEN** system displays all records without date restriction

### Requirement: Real-time search
The system SHALL update search results in real-time as the user types.

#### Scenario: Search updates as user types
- **WHEN** user types in the search field
- **THEN** system filters results after a short debounce delay (300ms)
- **AND** does not require pressing enter or clicking a search button
