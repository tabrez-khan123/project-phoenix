import type { 
  DeviceAssessmentInput, 
  AssessmentResult, 
  LedgerStats, 
  CommunityAction,
  DevicePathway,
  EnvironmentalImpact
} from '../types';

// Standard delays to mock network response times
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Submit device details and store them dynamically in localStorage
  async submitAssessment(input: Omit<DeviceAssessmentInput, 'images' | 'video'>): Promise<{ id: string }> {
    await delay(1000);
    const id = 'dev_' + Math.random().toString(36).substr(2, 9);
    
    // Store input in localStorage to retrieve during analysis/results
    localStorage.setItem('phoenix_current_assessment_id', id);
    localStorage.setItem(`phoenix_assessment_${id}`, JSON.stringify(input));
    
    return { id };
  },

  // Retrieve current active assessment input
  getCurrentAssessmentInput(id: string): Omit<DeviceAssessmentInput, 'images' | 'video'> | null {
    const data = localStorage.getItem(`phoenix_assessment_${id}`);
    return data ? JSON.parse(data) : null;
  },

  // Calculate and retrieve dynamic analysis results based on the submitted device details
  async getAssessmentResult(id: string): Promise<AssessmentResult> {
    await delay(800);
    const input = this.getCurrentAssessmentInput(id);
    
    const brand = input?.brand || 'Apple';
    const model = input?.model || 'MacBook Pro';
    const deviceType = input?.type || 'laptop';
    const condition = input?.condition || 'fair';
    const symptoms = input?.symptoms || 'Screen flickering, slow boot times';

    // Business Logic for pathways based on condition
    let recommendation: DevicePathway = 'refurbish';
    let confidenceScore = 88;
    let deviceHealthScore = 65;
    let valuePreservedUsd = 250;
    let lifecycleExtensionYears = 2.5;
    let co2AvoidedKg = 180;
    let eWastePreventedGrams = 1400;
    let evidence: string[] = [];
    let reasoning = '';

    if (deviceType === 'laptop') {
      eWastePreventedGrams = 2100;
      switch (condition) {
        case 'like-new':
          recommendation = 'resell';
          confidenceScore = 96;
          deviceHealthScore = 94;
          valuePreservedUsd = 750;
          lifecycleExtensionYears = 4;
          co2AvoidedKg = 320;
          evidence = [
            'Chassis is pristine with no visible scratches or dents',
            'Battery capacity is at 92% of original design',
            'Full hardware diagnostic checks passed (RAM, SSD, CPU)',
            'No thermal throttling detected during burn-in test'
          ];
          reasoning = `The laptop is in excellent cosmetic and operational shape. Reselling it captures the maximum residual market value while averting the 320kg of CO₂ that would be expended in manufacturing a brand new laptop. Refurbishing is unnecessary due to its near-perfect health status.`;
          break;
        case 'good':
          recommendation = 'refurbish';
          confidenceScore = 92;
          deviceHealthScore = 81;
          valuePreservedUsd = 480;
          lifecycleExtensionYears = 3;
          co2AvoidedKg = 280;
          evidence = [
            'Minor cosmetic wear on the outer shell and keys',
            'Battery health is at 84%, displaying normal wear',
            'Storage and memory are healthy, but can be optimized with system cleanup',
            'Ports are functional with slightly loose charging connection'
          ];
          reasoning = `With only minor wear and tear, this laptop is a prime candidate for professional refurbishing. Cleaning the internal thermals, applying fresh thermal paste, and restoring the operating system will prepare it for secondary ownership, saving 280kg of CO₂.`;
          break;
        case 'fair':
          recommendation = 'repair';
          confidenceScore = 89;
          deviceHealthScore = 62;
          valuePreservedUsd = 320;
          lifecycleExtensionYears = 2;
          co2AvoidedKg = 210;
          evidence = [
            `Reported: "${symptoms}"`,
            'Battery capacity degraded to 68% (Service Recommended)',
            'Thermal throttling present under average workload',
            'Keyboard backlighting is unresponsive on several keys'
          ];
          reasoning = `The device remains structurally sound, but key hardware components (specifically the battery and thermal system) require intervention. Replacing the battery and cleaning the dust build-up will successfully extend its lifespan by at least 2 years and preserve $320 of value.`;
          break;
        case 'poor':
          recommendation = 'donate';
          confidenceScore = 85;
          deviceHealthScore = 48;
          valuePreservedUsd = 180;
          lifecycleExtensionYears = 1.5;
          co2AvoidedKg = 150;
          evidence = [
            'Significant cosmetic scuffs and rubber pad wear',
            'Display backlight exhibits uneven brightness (minor issue)',
            'Operating system is functional but laggy; specs are low-end',
            'Standard educational applications run adequately'
          ];
          reasoning = `While the commercial resale value is low due to aged specs and cosmetic wear, it is fully functional for web browsing and basic software. Donating this laptop to community schools provides a vital digital tool for educational access and prevents it from entering the waste stream early.`;
          break;
        case 'broken':
        default:
          recommendation = 'harvest';
          confidenceScore = 91;
          deviceHealthScore = 18;
          valuePreservedUsd = 90;
          lifecycleExtensionYears = 0.5;
          co2AvoidedKg = 95;
          evidence = [
            'Display panel is cracked and completely unresponsive',
            'Motherboard power rail has short-circuited',
            'RAM and 512GB SSD storage modules are fully functional',
            'Metal aluminum housing can be cleanly separated and recovered'
          ];
          reasoning = `The cost of repairing the display and motherboard exceeds the market value of the laptop. The most sustainable path is to harvest the intact, fully functional components (RAM and SSD) for refurbishing other systems, and sending the aluminum chassis to an authorized recycler.`;
          break;
      }
    } else { // smartphone
      eWastePreventedGrams = 200;
      switch (condition) {
        case 'like-new':
          recommendation = 'resell';
          confidenceScore = 97;
          deviceHealthScore = 95;
          valuePreservedUsd = 450;
          lifecycleExtensionYears = 3;
          co2AvoidedKg = 90;
          evidence = [
            'OLED display has no screen burn or scratches',
            'Battery health registers at 96% peak capability',
            'Cameras, speakers, and wireless modules test perfectly',
            'IP rating seals are fully intact'
          ];
          reasoning = `This smartphone shows no wear and possesses high market demand. Reselling it immediately matches it with a second user, saving 90kg of CO₂ from new smartphone manufacturing and recovering $450 in value.`;
          break;
        case 'good':
          recommendation = 'refurbish';
          confidenceScore = 91;
          deviceHealthScore = 83;
          valuePreservedUsd = 280;
          lifecycleExtensionYears = 2.5;
          co2AvoidedKg = 80;
          evidence = [
            'Micro-scratches on glass back cover',
            'Battery capacity is at 87%',
            'Camera lens is clean, autofocus operates normally',
            'All buttons and biometric sensors are operational'
          ];
          reasoning = `This phone is in good shape. A cosmetic touch-up, diagnostic wipe, and repackaging will prepare it for a secondary market. Refurbishing preserves $280 of economic value.`;
          break;
        case 'fair':
          recommendation = 'repair';
          confidenceScore = 88;
          deviceHealthScore = 59;
          valuePreservedUsd = 190;
          lifecycleExtensionYears = 1.8;
          co2AvoidedKg = 65;
          evidence = [
            `Reported: "${symptoms}"`,
            'Battery health at 74% (Replace Recommended)',
            'USB-C charging port exhibits connection interruptions',
            'Screen glass has a minor hairline crack in the top corner'
          ];
          reasoning = `The internal board is healthy, but the battery and charging port need servicing. A simple repair (replacing port assembly and battery) restores complete functionality, extending the phone's lifecycle by 1.8 years.`;
          break;
        case 'poor':
          recommendation = 'donate';
          confidenceScore = 84;
          deviceHealthScore = 45;
          valuePreservedUsd = 100;
          lifecycleExtensionYears = 1.2;
          co2AvoidedKg = 50;
          evidence = [
            'Deep scratches on chassis; volume button is stiff',
            'Battery health at 79%',
            'Operating system version is limited; cannot run heavy apps',
            'Basic messaging, phone calls, and browser tools work fine'
          ];
          reasoning = `The device is outdated and worn, making resale unviable. However, it operates reliably for communication. Donating it to an NGO that distributes phones to digital inclusion campaigns gives it a second life.`;
          break;
        case 'broken':
        default:
          recommendation = 'recycle';
          confidenceScore = 95;
          deviceHealthScore = 12;
          valuePreservedUsd = 30;
          lifecycleExtensionYears = 0.1;
          co2AvoidedKg = 35;
          evidence = [
            'Severe screen breakage and digitizer failure',
            'Water damage indicator is triggered; motherboard corrosion',
            'Battery is bloated (Safety hazard - do not use)',
            'Valuable elements (gold and cobalt) can be extracted safely'
          ];
          reasoning = `The phone is chemically unstable due to a bloated battery and corroded circuits. It must not be powered on. The only safe and eco-friendly route is authorized recycling to extract precious metals and capture toxic substances.`;
          break;
      }
    }

    // Materials weights in grams
    const goldGrams = deviceType === 'laptop' ? 0.28 : 0.034;
    const copperGrams = deviceType === 'laptop' ? 120 : 15;
    const cobaltGrams = deviceType === 'laptop' ? 45 : 8;
    const aluminumGrams = deviceType === 'laptop' ? 680 : 35;

    const environmentalImpact: EnvironmentalImpact = {
      co2AvoidedKg,
      eWastePreventedGrams,
      valuableMaterialsRecovered: {
        goldGrams,
        copperGrams,
        cobaltGrams,
        aluminumGrams
      },
      treesEquivalent: Math.round(co2AvoidedKg / 22),
      carMilesAvoided: Math.round(co2AvoidedKg * 2.45)
    };

    return {
      deviceId: id,
      deviceType,
      brand,
      model,
      recommendation,
      confidenceScore,
      deviceHealthScore,
      evidence,
      reasoning,
      lifecycleExtensionYears,
      valuePreservedUsd,
      environmentalImpact
    };
  },

  // Mock global statistics
  async getGlobalLedgerStats(): Promise<LedgerStats> {
    await delay(500);
    // Dynamic values that slowly increment via state (or fixed values matching the screenshots)
    return {
      devicesSaved: 12480,
      co2AvoidedTons: 38.2,
      educationalDonations: 852,
      economicValuePreservedUsd: 2124500
    };
  },

  // Mock community actions feed
  async getCommunityActions(): Promise<CommunityAction[]> {
    await delay(600);
    return [
      {
        id: 'c1',
        userName: 'Elena R.',
        userLocation: 'Austin, TX',
        deviceType: 'laptop',
        brand: 'Dell',
        model: 'XPS 13',
        pathway: 'refurbish',
        timestamp: '2 mins ago',
        co2SavedKg: 280
      },
      {
        id: 'c2',
        userName: 'Marcus K.',
        userLocation: 'Berlin, DE',
        deviceType: 'smartphone',
        brand: 'Apple',
        model: 'iPhone 13',
        pathway: 'repair',
        timestamp: '14 mins ago',
        co2SavedKg: 65
      },
      {
        id: 'c3',
        userName: 'Siddharth M.',
        userLocation: 'Bangalore, IN',
        deviceType: 'laptop',
        brand: 'Lenovo',
        model: 'ThinkPad T14',
        pathway: 'donate',
        timestamp: '45 mins ago',
        co2SavedKg: 150
      },
      {
        id: 'c4',
        userName: 'Chloe L.',
        userLocation: 'San Francisco, CA',
        deviceType: 'smartphone',
        brand: 'Samsung',
        model: 'Galaxy S21',
        pathway: 'recycle',
        timestamp: '1 hour ago',
        co2SavedKg: 35
      },
      {
        id: 'c5',
        userName: 'Jean-Pierre T.',
        userLocation: 'Paris, FR',
        deviceType: 'laptop',
        brand: 'Apple',
        model: 'MacBook Pro 15"',
        pathway: 'harvest',
        timestamp: '3 hours ago',
        co2SavedKg: 95
      }
    ];
  }
};
