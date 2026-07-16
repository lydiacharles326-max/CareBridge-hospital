import { Doctor, Service, Testimonial, FAQItem, Feature } from './types';

export const services: Service[] = [
  {
    id: 'general',
    title: 'General Consultation',
    description: 'Comprehensive baseline health assessments, preventative clinical guidelines, and coordinate care plans tailored to your long-term wellness.',
    iconName: 'Activity',
    department: 'General Medicine',
    features: ['Routine physical exams', 'Chronic condition tracking', 'Preventative screenings', 'Immunizations']
  },
  {
    id: 'cardiology',
    title: 'Cardiology',
    description: 'Advanced clinical cardiac care specializing in non-invasive diagnostics, interventional therapies, and heart-health lifestyle rehabilitation.',
    iconName: 'Heart',
    department: 'Cardiovascular Center',
    features: ['Echocardiograms', 'Cardiac catheterization', 'Arrythmia tracking', 'Pacemaker tuning']
  },
  {
    id: 'pediatrics',
    title: 'Pediatrics',
    description: 'Nurturing, world-class healthcare for infants, toddlers, and adolescents delivered in a welcoming, stress-free setting.',
    iconName: 'Baby',
    department: 'Pediatric Wing',
    features: ['Childhood milestone checks', 'Pediatric allergy care', 'Acute illness therapy', 'Nutritional guidance']
  },
  {
    id: 'orthopedics',
    title: 'Orthopedics',
    description: 'Restoring joint and muscle mobility through micro-invasive joint replacements, sports injury medicine, and customized physical therapy plans.',
    iconName: 'Bone',
    department: 'Orthopedic & Joint Institute',
    features: ['Total hip & knee replacement', 'Arthroscopic surgeries', 'Spinal care services', 'Sports rehabilitation']
  },
  {
    id: 'neurology',
    title: 'Neurology',
    description: 'State-of-the-art neurological diagnostics and therapeutic paths for complex brain, spinal cord, and peripheral nerve disorders.',
    iconName: 'Brain',
    department: 'Neurological Sciences',
    features: ['EEG diagnostic mapping', 'Stroke prevention plans', 'Migraine therapy center', 'Sleep disorder analysis']
  },
  {
    id: 'dentistry',
    title: 'Dentistry & Oral Health',
    description: 'Complete general, cosmetic, and reconstructive dental procedures utilizing digital imaging and painless treatment methodologies.',
    iconName: 'Smile',
    department: 'Dental Arts',
    features: ['Painless root canals', 'Digital cosmetic design', 'Orthodontic solutions', 'Laser gum treatments']
  },
  {
    id: 'radiology',
    title: 'Advanced Radiology',
    description: 'High-resolution diagnostic imaging providing micro-level insights with minimal radiation exposure and rapid diagnostic turnarounds.',
    iconName: 'Eye',
    department: 'Imaging & Diagnostics',
    features: ['High-Tesla MRI scans', 'Ultra-low dose CT scans', 'Digital Mammography', 'Ultrasound profiling']
  },
  {
    id: 'emergency',
    title: 'Emergency Care',
    description: 'Immediate 24/7 level-1 emergency intervention staffed by board-certified trauma specialists, surgeons, and critical care units.',
    iconName: 'ShieldAlert',
    department: 'Level 1 Trauma Unit',
    features: ['Rapid response triage', 'Dedicated cardiac bays', 'Trauma operating rooms', 'Pediatric emergency zone']
  },
  {
    id: 'laboratory',
    title: 'Clinical Laboratory',
    description: 'Automated, fully certified diagnostics and pathology processing guaranteeing maximum clinical precision and quick doctor-portal sync.',
    iconName: 'FlaskConical',
    department: 'Pathology & Labs',
    features: ['Advanced blood panels', 'Biomarker tracking', 'Genetic screening', 'Rapid allergen testing']
  },
  {
    id: 'pharmacy',
    title: 'On-site Pharmacy',
    description: 'Full-service digital pharmacy offering personalized prescription management, compound medicine, and 24-hour drug safety consulting.',
    iconName: 'Pills',
    department: 'Pharmacy Services',
    features: ['Automated refills', 'Personalized compound scripts', 'Direct ward distribution', 'Therapeutic consultations']
  }
];

export const doctors: Doctor[] = [];

export const features: Feature[] = [
  {
    id: 'compassion',
    title: 'Compassionate Care First',
    description: 'We believe health is deeply personal. Our clinical approach values dignity, listening, and treating every patient like immediate family.',
    iconName: 'HeartHandshake'
  },
  {
    id: 'equipment',
    title: 'Next-Generation Tech',
    description: 'Equipped with ultra-modern robotic surgery rigs, advanced 3T MRI, and high-precision clinical pathology tools.',
    iconName: 'Cpu'
  },
  {
    id: 'experts',
    title: 'Elite Medical Experts',
    description: 'Our board-certified department chairs and specialists hold elite tenures and credentials from global pinnacle universities.',
    iconName: 'Award'
  },
  {
    id: 'records',
    title: 'Digital Health Ecosystem',
    description: 'Instant, highly secure patient portal syncing medical histories, prescription charts, and live laboratory reports.',
    iconName: 'Activity'
  },
  {
    id: 'affordable',
    title: 'Transparent Pricing & Care',
    description: 'Direct care agreements and partnership networks with major global insurances, delivering optimal clarity in billing.',
    iconName: 'Coins'
  },
  {
    id: 'emergency',
    title: '24/7 Emergency Wing',
    description: 'Fully integrated Level-1 trauma response team operating 365 days a year to manage high-priority acute medical crises.',
    iconName: 'ShieldAlert'
  }
];

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Amara Nwosu',
    role: 'Cardiac Recovery Patient',
    content: 'The cardiac surgical team at CareBridge gave me my life back. From the luxurious private suite to the warm check-ins by Dr. Okafor, the experience felt more like a premium wellness retreat than a medical stay.',
    rating: 5,
    image: '/src/assets/images/patient_female_1_1784146318634.jpg',
    date: 'June 12, 2026'
  },
  {
    id: 'test-2',
    name: 'Olumide Bakare',
    role: 'Father of Pediatric Patient',
    content: 'Dr. Funmilayo Adebayo is an absolute angel. My 5-year-old was extremely anxious about his treatment, but the pediatric wing’s welcoming atmosphere and her playful, gentle examination had him laughing in minutes.',
    rating: 5,
    image: '/src/assets/images/patient_male_1_1784146329662.jpg',
    date: 'May 28, 2026'
  },
  {
    id: 'test-3',
    name: 'Zainab Bello',
    role: 'Orthopedic Patient',
    content: 'After a severe joint accident, I feared I’d never jog again. Dr. Babatunde Balogun’s meticulous arthroscopic surgery and the personalized sports rehab team had me back on my feet ahead of schedule. Truly state-of-the-art care.',
    rating: 5,
    image: '/src/assets/images/patient_female_2_1784146342065.jpg',
    date: 'April 14, 2026'
  }
];

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I book an appointment with a specialist at CareBridge?',
    answer: 'You can easily book an appointment using our interactive online booking engine above. Alternatively, you can call our direct reservation line at +234 (9) 461-3700 for 24/7 personal assistance.'
  },
  {
    id: 'faq-2',
    question: 'Does CareBridge Hospital accept international medical insurances?',
    answer: 'Yes. CareBridge partners with major domestic and international private insurance networks, including Bupa, Allianz, Cigna, and Blue Cross Blue Shield. Our billing coordinators will manage pre-authorizations for you.'
  },
  {
    id: 'faq-3',
    question: 'What are the visiting hours for inpatient wards?',
    answer: 'To balance patient rest and emotional support, our standard visiting hours are from 8:00 AM to 8:00 PM daily. Intensive Care Units (ICUs) have specialized schedules managed by the ward charge nurse.'
  },
  {
    id: 'faq-4',
    question: 'How does the digital health records portal work?',
    answer: 'Upon your first consultation, you will receive a secure portal activation code via email. The patient portal provides instant access to prescription instructions, lab results, MRI scans, and lets you message your physician team directly.'
  },
  {
    id: 'faq-5',
    question: 'Are there emergency surgical units available overnight?',
    answer: 'Yes. CareBridge operates a Level-1 Trauma Emergency Department with fully staffed surgical theaters, trauma physicians, anesthesiologists, and blood banks operating 24 hours a day, 365 days a year.'
  }
];
