# Requirements Document

## Introduction

The Packaged Food Scanner is a mobile application designed to help users with food allergies in India identify allergens in packaged foods, restaurant menus, and street food. The system uses barcode scanning, OCR technology, and allergen databases to provide real-time safety alerts based on the user's personal allergy profile. The app supports multiple Indian languages and includes an emergency mode for allergic reaction guidance.

## Glossary

- **Scanner**: The mobile application component that captures and processes barcodes or images
- **Allergen_Database**: The backend system storing allergen information for products and dishes
- **User_Profile**: The stored collection of a user's allergen sensitivities and emergency contact information
- **OCR_Engine**: The optical character recognition system that extracts text from images
- **Safety_Alert**: A visual indicator (🟢 Safe, 🟡 Caution, 🔴 Not Safe) showing allergen risk level
- **Emergency_Assistant**: The LLM-powered component that provides guidance during allergic reactions
- **FSSAI**: Food Safety and Standards Authority of India, the regulatory body for food safety
- **Barcode_Scanner**: The component that reads product barcodes using device camera
- **Menu_Scanner**: The component that processes restaurant menu and street food images

## Requirements

### Requirement 1: Barcode Scanning for Packaged Foods

**User Story:** As a user with food allergies, I want to scan packaged food barcodes, so that I can quickly identify if the product contains my allergens.

#### Acceptance Criteria

1. WHEN a user initiates a barcode scan, THE Scanner SHALL activate the device camera and detect barcodes in the camera view
2. WHEN a barcode is successfully detected, THE Scanner SHALL query the Allergen_Database with the barcode value
3. WHEN the Allergen_Database returns product information, THE Scanner SHALL compare the product ingredients against the User_Profile allergen list
4. WHEN the comparison is complete, THE Scanner SHALL display a Safety_Alert indicating 🟢 Safe, 🟡 Caution, or 🔴 Not Safe
5. WHEN a barcode is not found in the database, THE Scanner SHALL automatically switch to OCR mode to capture ingredient text from the package

### Requirement 2: OCR Fallback for Packaged Foods

**User Story:** As a user scanning a product without barcode data, I want the app to read ingredients from the package label, so that I can still check for allergens.

#### Acceptance Criteria

1. WHEN OCR mode is activated, THE Scanner SHALL capture an image of the ingredient label
2. WHEN an image is captured, THE OCR_Engine SHALL extract text from the image
3. WHEN text is extracted, THE Scanner SHALL parse the ingredient list from the extracted text
4. WHEN ingredients are identified, THE Scanner SHALL compare them against the User_Profile allergen list
5. WHEN the comparison is complete, THE Scanner SHALL display a Safety_Alert with detected allergens highlighted

### Requirement 3: Menu and Street Food Scanning

**User Story:** As a user dining at restaurants or street food stalls, I want to scan menu items, so that I can identify dishes that may contain my allergens.

#### Acceptance Criteria

1. WHEN a user captures a menu image, THE OCR_Engine SHALL extract text in multiple Indian scripts including Hindi, Tamil, Telugu, and Bengali
2. WHEN menu text is extracted, THE Menu_Scanner SHALL identify dish names from the extracted text
3. WHEN dish names are identified, THE Menu_Scanner SHALL query the Allergen_Database for allergen information associated with each dish
4. WHEN allergen information is retrieved, THE Menu_Scanner SHALL compare it against the User_Profile allergen list
5. WHEN the comparison is complete, THE Menu_Scanner SHALL display warnings for dishes containing user allergens

### Requirement 4: Personal Allergy Profile Management

**User Story:** As a user with specific food allergies, I want to create and manage my allergy profile, so that the app can provide personalized allergen warnings.

#### Acceptance Criteria

1. WHEN a user creates a profile, THE User_Profile SHALL allow selection from FSSAI-listed allergens including peanut, tree nuts, milk, eggs, wheat, gluten, soy, seafood, and sesame
2. WHEN a user updates their allergen list, THE User_Profile SHALL persist the changes to storage
3. WHEN a user adds an emergency contact, THE User_Profile SHALL store the contact name and phone number
4. WHEN a user retrieves their profile, THE User_Profile SHALL return all stored allergen preferences and emergency contact information
5. THE User_Profile SHALL be accessible across all scanning features for allergen comparison

### Requirement 5: Multi-Language Support

**User Story:** As a user who prefers to use the app in my native language, I want the interface and alerts in my chosen language, so that I can understand the information clearly.

#### Acceptance Criteria

1. WHEN a user selects a preferred language, THE Scanner SHALL display all UI elements in that language including Hindi, Punjabi, Tamil, and Bengali
2. WHEN the OCR_Engine processes an image, THE OCR_Engine SHALL support text recognition in multiple Indian scripts
3. WHEN a Safety_Alert is displayed, THE Scanner SHALL show the alert message in the user's preferred language
4. WHEN instructions are shown, THE Scanner SHALL present them in the user's preferred language
5. WHEN a user changes their language preference, THE Scanner SHALL update all UI elements immediately

### Requirement 6: Emergency Mode Guidance

**User Story:** As a user experiencing an allergic reaction, I want step-by-step emergency guidance, so that I can respond appropriately and get help quickly.

#### Acceptance Criteria

1. WHEN a user activates emergency mode, THE Emergency_Assistant SHALL provide step-by-step first aid instructions including epinephrine use and positioning
2. WHEN emergency mode is active, THE Emergency_Assistant SHALL display instructions to call emergency services at 112
3. WHEN emergency mode is activated, THE Emergency_Assistant SHALL retrieve the device GPS location
4. WHEN GPS location is obtained, THE Emergency_Assistant SHALL send an alert to the emergency contact stored in User_Profile with the location
5. WHEN requested, THE Emergency_Assistant SHALL display a medical ID screen showing the user's allergen information for first responders

### Requirement 7: Product Data Integration

**User Story:** As a system administrator, I want the app to integrate with food databases, so that users receive accurate and up-to-date allergen information.

#### Acceptance Criteria

1. WHEN a barcode is scanned, THE Allergen_Database SHALL query OpenFoodFacts API for product information
2. WHEN OpenFoodFacts API does not return results, THE Allergen_Database SHALL query Fitterfly Nutrition API as a fallback
3. WHEN product data is retrieved, THE Allergen_Database SHALL extract ingredient lists and allergen declarations
4. WHEN storing product data, THE Allergen_Database SHALL comply with FSSAI 2020 allergen declaration rules
5. WHERE oils from allergenic sources are present, THE Allergen_Database SHALL apply FSSAI exemption rules for allergen warnings

### Requirement 8: API Endpoints for Client Applications

**User Story:** As a mobile app developer, I want well-defined API endpoints, so that I can integrate scanning and profile features into the client application.

#### Acceptance Criteria

1. THE Allergen_Database SHALL provide a GET endpoint at /scan/barcode accepting a barcode parameter
2. WHEN the barcode endpoint is called, THE Allergen_Database SHALL return product name, ingredients, and allergen information
3. THE Allergen_Database SHALL provide a POST endpoint at /scan/image accepting image data
4. WHEN the image endpoint is called, THE Allergen_Database SHALL process the image with OCR and return extracted ingredients and allergen warnings
5. THE User_Profile SHALL provide GET and POST endpoints at /profile for retrieving and updating user allergen preferences and emergency contacts

### Requirement 9: Data Persistence and Storage

**User Story:** As a user, I want my allergy profile and scan history to be saved, so that I don't have to re-enter information each time I use the app.

#### Acceptance Criteria

1. WHEN a User_Profile is created or updated, THE User_Profile SHALL persist data to storage with fields userId, allergies array, and emergencyContact
2. WHEN product information is retrieved, THE Allergen_Database SHALL cache product data with fields barcode, name, ingredients array, and contains array
3. WHEN dish information is stored, THE Allergen_Database SHALL save dish data with fields name, allergens array, and languages object
4. WHEN a user logs in, THE User_Profile SHALL retrieve the user's stored allergen preferences and emergency contact
5. WHEN the app is offline, THE Scanner SHALL access cached product data for previously scanned items

### Requirement 10: Safety Constraints for Emergency LLM

**User Story:** As a product owner, I want the emergency assistant to provide safe and appropriate medical guidance, so that users receive helpful information without medical liability.

#### Acceptance Criteria

1. WHEN the Emergency_Assistant generates guidance, THE Emergency_Assistant SHALL limit responses to first aid instructions and emergency service contact information
2. WHEN the Emergency_Assistant is queried, THE Emergency_Assistant SHALL not provide medical diagnoses or treatment recommendations beyond basic first aid
3. WHEN the Emergency_Assistant provides instructions, THE Emergency_Assistant SHALL include disclaimers to seek professional medical help
4. WHEN the Emergency_Assistant detects severe symptoms in user input, THE Emergency_Assistant SHALL prioritize instructions to call emergency services immediately
5. THE Emergency_Assistant SHALL operate within medical safety constraints defined for the LLM model
