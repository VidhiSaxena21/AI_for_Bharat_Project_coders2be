# Design Document: Packaged Food Scanner

## Overview

The Packaged Food Scanner is a cross-platform mobile application built with Flutter or React Native that helps users with food allergies identify allergens in packaged foods, restaurant menus, and street food. The system consists of a mobile client, a backend API service, and integrations with external services for barcode scanning, OCR, product databases, and emergency LLM assistance.

The architecture follows a client-server model where the mobile app handles user interaction and camera operations, while the backend manages data persistence, external API integrations, and allergen matching logic. The system prioritizes user safety by providing clear visual alerts and supporting emergency scenarios.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Application                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Barcode    │  │     OCR      │  │   Profile    │      │
│  │   Scanner    │  │   Scanner    │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Menu      │  │  Emergency   │  │    i18n      │      │
│  │   Scanner    │  │   Assistant  │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Service                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Barcode    │  │     OCR      │  │   Profile    │      │
│  │   Handler    │  │   Handler    │  │    API       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Allergen   │  │   Emergency  │  │    Cache     │      │
│  │   Matcher    │  │   LLM Proxy  │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   MongoDB/   │  │    Google    │  │ OpenFoodFacts│
│   Firebase   │  │ Cloud Vision │  │  Fitterfly   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Technology Stack

- **Mobile**: Flutter or React Native for cross-platform development
- **Backend**: Node.js (Express) or Python (FastAPI)
- **Database**: MongoDB or Firebase Firestore
- **OCR**: Google ML Kit (on-device) and Google Cloud Vision API (cloud)
- **Barcode**: ZXing or Scandit SDK
- **LLM**: GPT-4o via OpenAI API with medical safety constraints
- **APIs**: OpenFoodFacts API, Fitterfly Nutrition API

## Components and Interfaces

### Mobile Application Components

#### Barcode Scanner Component

**Responsibilities:**
- Initialize device camera for barcode scanning
- Detect and decode barcodes using ZXing/Scandit
- Send barcode to backend API
- Display safety alerts based on response

**Interface:**
```typescript
interface BarcodeScanner {
  startScan(): Promise<void>
  stopScan(): void
  onBarcodeDetected(barcode: string): Promise<ScanResult>
}

interface ScanResult {
  productName: string
  ingredients: string[]
  allergens: string[]
  safetyLevel: 'safe' | 'caution' | 'unsafe'
  matchedAllergens: string[]
}
```

#### OCR Scanner Component

**Responsibilities:**
- Capture images of ingredient labels or menus
- Process images with on-device ML Kit or cloud Vision API
- Extract text in multiple Indian scripts
- Parse ingredient lists or dish names
- Send extracted data to backend for allergen matching

**Interface:**
```typescript
interface OCRScanner {
  captureImage(): Promise<ImageData>
  extractText(image: ImageData, languages: string[]): Promise<string>
  parseIngredients(text: string): string[]
  parseDishNames(text: string): string[]
}

interface ImageData {
  uri: string
  base64: string
  width: number
  height: number
}
```

#### Profile Manager Component

**Responsibilities:**
- Manage user allergen selections
- Store and retrieve emergency contact information
- Persist profile data locally and sync with backend
- Provide allergen list to scanning components

**Interface:**
```typescript
interface ProfileManager {
  getAllergens(): string[]
  setAllergens(allergens: string[]): Promise<void>
  getEmergencyContact(): EmergencyContact
  setEmergencyContact(contact: EmergencyContact): Promise<void>
  syncProfile(): Promise<void>
}

interface EmergencyContact {
  name: string
  phone: string
}
```

#### Emergency Assistant Component

**Responsibilities:**
- Provide step-by-step first aid guidance
- Retrieve GPS location
- Send alerts to emergency contacts
- Display medical ID information
- Interface with LLM for contextual guidance

**Interface:**
```typescript
interface EmergencyAssistant {
  activateEmergency(): Promise<void>
  getFirstAidSteps(): Promise<string[]>
  getLocation(): Promise<Location>
  alertEmergencyContact(location: Location): Promise<void>
  displayMedicalID(): MedicalID
  getLLMGuidance(symptoms: string): Promise<string>
}

interface Location {
  latitude: number
  longitude: number
  accuracy: number
}

interface MedicalID {
  allergens: string[]
  emergencyContact: EmergencyContact
  bloodType?: string
}
```

### Backend API Components

#### Barcode Handler

**Responsibilities:**
- Receive barcode scan requests
- Query OpenFoodFacts API
- Fallback to Fitterfly Nutrition API
- Cache product data
- Return product information

**Interface:**
```typescript
interface BarcodeHandler {
  handleBarcodeRequest(barcode: string): Promise<ProductData>
  queryOpenFoodFacts(barcode: string): Promise<ProductData | null>
  queryFitterfly(barcode: string): Promise<ProductData | null>
  cacheProduct(product: ProductData): Promise<void>
}

interface ProductData {
  barcode: string
  name: string
  ingredients: string[]
  allergens: string[]
  source: 'openfoodfacts' | 'fitterfly' | 'cache'
}
```

#### OCR Handler

**Responsibilities:**
- Receive image data from mobile client
- Process images with Google Cloud Vision API
- Extract text in multiple languages
- Parse ingredient lists or dish names
- Return structured data

**Interface:**
```typescript
interface OCRHandler {
  processImage(imageData: string, type: 'package' | 'menu'): Promise<OCRResult>
  extractTextFromImage(imageData: string, languages: string[]): Promise<string>
  parseIngredientList(text: string): string[]
  parseDishList(text: string): string[]
}

interface OCRResult {
  extractedText: string
  ingredients?: string[]
  dishes?: string[]
  confidence: number
}
```

#### Allergen Matcher

**Responsibilities:**
- Compare ingredients/dishes against user allergen profile
- Determine safety level (safe, caution, unsafe)
- Identify matched allergens
- Apply FSSAI exemption rules

**Interface:**
```typescript
interface AllergenMatcher {
  matchAllergens(items: string[], userAllergens: string[]): MatchResult
  determineSafetyLevel(matchedAllergens: string[]): SafetyLevel
  applyFSSAIRules(allergens: string[], ingredients: string[]): string[]
}

interface MatchResult {
  safetyLevel: SafetyLevel
  matchedAllergens: string[]
  warnings: string[]
}

type SafetyLevel = 'safe' | 'caution' | 'unsafe'
```

#### Profile API

**Responsibilities:**
- Store and retrieve user profiles
- Manage allergen preferences
- Store emergency contact information
- Handle profile synchronization

**Interface:**
```typescript
interface ProfileAPI {
  getProfile(userId: string): Promise<UserProfile>
  updateProfile(userId: string, profile: UserProfile): Promise<void>
  createProfile(profile: UserProfile): Promise<string>
}

interface UserProfile {
  userId: string
  allergens: string[]
  emergencyContact: EmergencyContact
  preferredLanguage: string
  createdAt: Date
  updatedAt: Date
}
```

#### Emergency LLM Proxy

**Responsibilities:**
- Interface with GPT-4o API
- Apply medical safety constraints
- Generate contextual emergency guidance
- Filter inappropriate medical advice
- Log emergency interactions

**Interface:**
```typescript
interface EmergencyLLMProxy {
  getGuidance(symptoms: string, allergens: string[]): Promise<string>
  validateResponse(response: string): boolean
  applyMedicalConstraints(prompt: string): string
}
```

## Data Models

### User Profile Schema

```typescript
{
  userId: string,              // Unique identifier
  allergens: string[],         // List of user allergens
  emergencyContact: {
    name: string,
    phone: string
  },
  preferredLanguage: string,   // ISO language code
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema

```typescript
{
  barcode: string,             // Product barcode
  name: string,                // Product name
  ingredients: string[],       // List of ingredients
  allergens: string[],         // Declared allergens
  source: string,              // Data source
  lastUpdated: Date,
  languages: {                 // Multi-language support
    [languageCode: string]: {
      name: string,
      ingredients: string[]
    }
  }
}
```

### Dish Schema

```typescript
{
  dishId: string,              // Unique identifier
  name: string,                // Dish name
  allergens: string[],         // Common allergens in dish
  region: string,              // Indian region/cuisine
  languages: {                 // Multi-language names
    [languageCode: string]: string
  },
  commonIngredients: string[]
}
```

### Scan History Schema

```typescript
{
  scanId: string,
  userId: string,
  type: 'barcode' | 'package_ocr' | 'menu',
  timestamp: Date,
  result: {
    productName?: string,
    dishes?: string[],
    safetyLevel: SafetyLevel,
    matchedAllergens: string[]
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Allergen Matching Consistency

*For any* ingredient list or dish list and any user allergen profile, when the allergen matcher compares them, all ingredients or dishes containing user allergens should be identified and included in the matched allergens list.

**Validates: Requirements 1.3, 2.4, 3.4**

### Property 2: Safety Level Determination

*For any* allergen match result, the safety level should be 'unsafe' if any allergens match, 'safe' if no allergens match, and 'caution' for potential cross-contamination or uncertain matches.

**Validates: Requirements 1.4, 2.5, 3.5**

### Property 3: Barcode Query Triggering

*For any* detected barcode value, the scanner should trigger a database query with that exact barcode value.

**Validates: Requirements 1.2**

### Property 4: OCR Fallback Activation

*For any* barcode lookup that returns no results or null, the system should automatically activate OCR mode.

**Validates: Requirements 1.5**

### Property 5: Ingredient Parsing Completeness

*For any* extracted text containing ingredient lists, the parser should identify and extract all ingredients separated by commas, semicolons, or other standard delimiters.

**Validates: Requirements 2.3**

### Property 6: Dish Name Extraction

*For any* menu text containing dish names, the parser should identify and extract dish names based on menu formatting patterns.

**Validates: Requirements 3.2**

### Property 7: Dish Allergen Query

*For any* identified dish name, the system should query the allergen database for that dish's allergen information.

**Validates: Requirements 3.3**

### Property 8: Profile Data Round-Trip

*For any* user profile containing allergen list and emergency contact, storing then retrieving the profile should produce an equivalent profile with all fields intact (userId, allergens array, emergencyContact).

**Validates: Requirements 4.2, 4.3, 4.4, 9.1, 9.4**

### Property 9: FSSAI Allergen Acceptance

*For any* FSSAI-listed allergen (peanut, tree nuts, milk, eggs, wheat, gluten, soy, seafood, sesame), the user profile should accept and store that allergen in the allergen list.

**Validates: Requirements 4.1**

### Property 10: UI Localization Consistency

*For any* supported language preference and any UI element (alerts, instructions, labels), the displayed text should be in the user's preferred language.

**Validates: Requirements 5.1, 5.3, 5.4**

### Property 11: Language Preference Update Reactivity

*For any* language preference change, all currently visible UI elements should update to display text in the new language.

**Validates: Requirements 5.5**

### Property 12: Emergency Contact Alert Delivery

*For any* GPS location and any emergency contact in the user profile, when emergency mode is activated, an alert containing the location should be sent to that emergency contact.

**Validates: Requirements 6.4**

### Property 13: Medical ID Completeness

*For any* user profile with allergens, the medical ID display should include all allergens from the profile.

**Validates: Requirements 6.5**

### Property 14: API Fallback Chain

*For any* barcode query where OpenFoodFacts returns no results, the system should query Fitterfly Nutrition API as the next attempt.

**Validates: Requirements 7.2**

### Property 15: Product Data Field Extraction

*For any* product data retrieved from external APIs, the system should extract and store the ingredient list and allergen declarations if present in the source data.

**Validates: Requirements 7.3**

### Property 16: FSSAI Oil Exemption

*For any* product containing oils from allergenic sources (e.g., peanut oil, soy oil), the allergen matcher should apply FSSAI exemption rules and not flag these as allergen matches unless the oil is unrefined.

**Validates: Requirements 7.5**

### Property 17: API Response Completeness

*For any* successful API request to /scan/barcode or /scan/image, the response should contain all required fields: product name (or dishes), ingredients (or extracted text), and allergen information.

**Validates: Requirements 8.2, 8.4**

### Property 18: Cache Persistence Round-Trip

*For any* product or dish data cached by the system, retrieving that data from cache should produce equivalent data with all fields intact (barcode/dishId, name, ingredients/allergens, metadata).

**Validates: Requirements 9.2, 9.3**

### Property 19: Offline Cache Access

*For any* product that was previously scanned and cached, when the app is offline, the scanner should be able to retrieve and display that product's cached data.

**Validates: Requirements 9.5**

### Property 20: Emergency Disclaimer Inclusion

*For any* instruction or guidance generated by the Emergency Assistant, the output should include a disclaimer to seek professional medical help.

**Validates: Requirements 10.3**

## Error Handling

### Barcode Scanning Errors

**Camera Access Denied:**
- Display user-friendly message explaining camera permission requirement
- Provide link to app settings to enable camera permission
- Offer alternative OCR mode for manual ingredient entry

**Barcode Not Detected:**
- Show visual guidance for proper barcode positioning
- Provide manual barcode entry option
- Automatically switch to OCR mode after timeout

**Network Errors During Barcode Lookup:**
- Check local cache first before showing error
- Display offline mode indicator
- Queue request for retry when connection restored
- Show last known product information if available

### OCR Processing Errors

**Image Quality Issues:**
- Provide real-time feedback on image clarity
- Suggest better lighting or closer positioning
- Allow multiple image captures for better results

**Text Extraction Failures:**
- Fall back to manual ingredient entry
- Provide template for common ingredient formats
- Save image for later processing when connection improves

**Language Detection Errors:**
- Allow manual language selection
- Support mixed-language text extraction
- Provide feedback when unsupported script detected

### API Integration Errors

**External API Timeouts:**
- Implement exponential backoff retry logic
- Fall back to secondary API within 3 seconds
- Cache partial results to minimize data loss
- Display user-friendly timeout message

**Rate Limiting:**
- Implement request queuing with priority
- Cache aggressively to reduce API calls
- Display estimated wait time to user
- Offer offline mode with cached data

**Invalid API Responses:**
- Validate response schema before processing
- Log malformed responses for debugging
- Fall back to alternative data source
- Display generic error without exposing technical details

### Data Persistence Errors

**Storage Quota Exceeded:**
- Implement LRU cache eviction policy
- Prioritize user profile and recent scans
- Notify user of storage limitations
- Offer option to clear old scan history

**Sync Failures:**
- Queue changes for background sync
- Maintain local-first data model
- Resolve conflicts with last-write-wins strategy
- Display sync status indicator

### Emergency Mode Errors

**Location Services Disabled:**
- Prompt user to enable location services
- Proceed with emergency guidance without location
- Display manual location entry option
- Include location permission in onboarding

**Emergency Contact Not Set:**
- Display prominent warning during emergency activation
- Offer quick contact entry flow
- Proceed with first aid guidance regardless
- Remind user to set contact after emergency

**LLM API Failures:**
- Fall back to pre-defined emergency instructions
- Display offline emergency guide
- Log failure for monitoring
- Ensure core emergency features work without LLM

### Validation Errors

**Invalid User Input:**
- Provide inline validation feedback
- Suggest corrections for common mistakes
- Prevent submission of invalid data
- Display clear error messages in user's language

**Malformed Allergen Data:**
- Sanitize and normalize allergen names
- Map common variations to standard terms
- Warn user about unrecognized allergens
- Allow custom allergen entry with confirmation

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points between components
- **Property Tests**: Verify universal properties across all inputs through randomized testing

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide input space.

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: fast-check
- **Python**: Hypothesis
- **Flutter/Dart**: test_api with custom generators

**Test Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: packaged-food-scanner, Property {number}: {property_text}`

**Property Test Implementation:**
- Each correctness property must be implemented by a single property-based test
- Tests should generate random valid inputs (allergen lists, ingredient lists, user profiles)
- Tests should verify the property holds for all generated inputs
- Tests should shrink failing cases to minimal counterexamples

### Unit Testing Focus

Unit tests should focus on:
- Specific examples demonstrating correct behavior (e.g., scanning a known barcode)
- Edge cases (empty ingredient lists, special characters, very long lists)
- Error conditions (network failures, invalid API responses, missing data)
- Integration between components (scanner → API → matcher → UI)
- Hardware interactions (camera, GPS) using mocks

Avoid writing too many unit tests for scenarios that property tests already cover comprehensively.

### Test Coverage Areas

**Barcode Scanning:**
- Unit: Test specific barcode formats (EAN-13, UPC-A), camera initialization, error states
- Property: Verify all barcodes trigger queries, all results produce safety alerts

**OCR Processing:**
- Unit: Test specific ingredient label formats, multi-language examples, image quality edge cases
- Property: Verify all extracted text is parsed, all ingredients are identified

**Allergen Matching:**
- Unit: Test specific allergen combinations, FSSAI exemptions, edge cases
- Property: Verify all user allergens are matched, safety levels are consistent

**Profile Management:**
- Unit: Test profile creation, update flows, validation errors
- Property: Verify round-trip persistence, all FSSAI allergens accepted

**Localization:**
- Unit: Test specific language translations, script rendering
- Property: Verify all UI elements localized for all supported languages

**Emergency Mode:**
- Unit: Test specific emergency scenarios, contact alert delivery, GPS edge cases
- Property: Verify all profiles produce medical IDs, all locations trigger alerts

**API Integration:**
- Unit: Test specific API responses, error handling, timeout scenarios
- Property: Verify all requests produce responses with required fields, fallback chain works

**Caching:**
- Unit: Test cache eviction, offline access, sync conflicts
- Property: Verify round-trip persistence, offline access for all cached items

### Integration Testing

- Test end-to-end flows: barcode scan → API query → allergen match → alert display
- Test offline scenarios with cached data
- Test emergency mode activation and contact alerting
- Test language switching across all screens
- Test API fallback chains with simulated failures

### Performance Testing

- Barcode detection latency: < 500ms
- OCR processing time: < 3 seconds for standard images
- API response time: < 2 seconds for cached products
- Profile sync time: < 1 second
- Emergency mode activation: < 500ms

### Security Testing

- Validate all user inputs to prevent injection attacks
- Test API authentication and authorization
- Verify secure storage of user profiles
- Test emergency contact data privacy
- Validate LLM prompt injection prevention
