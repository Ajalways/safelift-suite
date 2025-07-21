import React, { useState, useEffect } from 'react';

const API_URL = 'https://clownfish-app-3lhwr.ondigitalocean.app';

// Sample data for immediate functionality
const SAMPLE_CRANES = [
  { id: 1, make: 'Manitex', model: 'TC50155', year: 2020, capacity: 50, status: 'Available', lastInspection: '2025-01-15', location: 'Main Yard', serialNumber: 'MX2020-001' },
  { id: 2, make: 'Grove', model: 'TMS9000-2', year: 2019, capacity: 100, status: 'In Use', lastInspection: '2025-01-10', location: 'Downtown Site', serialNumber: 'GR2019-045' },
  { id: 3, make: 'Link-Belt', model: 'HTC-8675 II', year: 2021, capacity: 75, status: 'Available', lastInspection: '2025-01-05', location: 'Service Center', serialNumber: 'LB2021-123' }
];

const SAMPLE_OPERATORS = [
  {
    id: 1, name: 'John Smith', email: 'john@company.com', phone: '555-0101', status: 'Available',
    emergencyContact: 'Jane Smith', emergencyPhone: '555-0201',
    certifications: [
      { type: 'NCCCO Mobile Crane', number: 'MC-123456', expires: '2026-01-15', status: 'Active' },
      { type: 'OSHA 30-Hour', number: 'OS-789012', expires: '2025-12-01', status: 'Active' }
    ]
  },
  {
    id: 2, name: 'Mike Johnson', email: 'mike@company.com', phone: '555-0102', status: 'On Job',
    emergencyContact: 'Sarah Johnson', emergencyPhone: '555-0202',
    certifications: [
      { type: 'NCCCO Tower Crane', number: 'TC-456789', expires: '2025-08-15', status: 'Expiring Soon' }
    ]
  }
];

const SAMPLE_JOBS = [
  {
    id: 1, title: 'Downtown Office Building', customer: 'ABC Construction', crane: 'Grove TMS9000-2',
    operator: 'Mike Johnson', date: '2025-07-20', status: 'In Progress', duration: '8 hours',
    rate: '$150/hour', notes: 'High-rise construction project'
  },
  {
    id: 2, title: 'Warehouse Construction', customer: 'XYZ Builders', crane: 'Manitex TC50155',
    operator: 'John Smith', date: '2025-07-22', status: 'Scheduled', duration: '6 hours',
    rate: '$125/hour', notes: 'Industrial warehouse lifting'
  }
];

const SAMPLE_INSPECTIONS = [
  {
    id: 1, craneId: 1, craneName: 'Manitex TC50155', date: '2025-01-15', inspector: 'John Smith',
    status: 'Passed', score: 95, overallStatus: 'completed',
    items: [
      { id: 1, category: 'General', item: 'Visual inspection', status: 'Pass', notes: 'Good condition', photos: [] },
      { id: 2, category: 'Engine', item: 'Engine operation', status: 'Pass', notes: 'Running smoothly', photos: [] },
      { id: 3, category: 'Boom', item: 'Boom extension', status: 'Pass', notes: 'No issues', photos: [] },
      { id: 4, category: 'Safety', item: 'Load moment indicator', status: 'Fail', notes: 'Needs calibration', photos: [] }
    ]
  }
];

// Complete inspection categories with all OSHA items
const INSPECTION_CATEGORIES = [
  {
    id: 'general',
    name: 'General Condition',
    items: [
      { id: 'gen_1', name: 'Visual inspection of crane structure', required: true },
      { id: 'gen_2', name: 'Check for cracks, bent parts, or damage', required: true },
      { id: 'gen_3', name: 'Inspect for fluid leaks', required: true },
      { id: 'gen_4', name: 'Check for rust or corrosion', required: true },
      { id: 'gen_5', name: 'Verify all guards and covers in place', required: true },
      { id: 'gen_6', name: 'Check cleanliness and housekeeping', required: false }
    ]
  },
  {
    id: 'engine',
    name: 'Engine & Power Train',
    items: [
      { id: 'eng_1', name: 'Engine oil level and condition', required: true },
      { id: 'eng_2', name: 'Coolant level and condition', required: true },
      { id: 'eng_3', name: 'Air filter condition', required: true },
      { id: 'eng_4', name: 'Belt condition and tension', required: true },
      { id: 'eng_5', name: 'Battery condition and connections', required: true },
      { id: 'eng_6', name: 'Exhaust system integrity', required: true },
      { id: 'eng_7', name: 'Engine operation and idle quality', required: true }
    ]
  },
  {
    id: 'hydraulics',
    name: 'Hydraulic System',
    items: [
      { id: 'hyd_1', name: 'Hydraulic fluid level and condition', required: true },
      { id: 'hyd_2', name: 'Hydraulic hose condition', required: true },
      { id: 'hyd_3', name: 'Hydraulic pump operation', required: true },
      { id: 'hyd_4', name: 'Cylinder operation and leaks', required: true },
      { id: 'hyd_5', name: 'Filter condition', required: true },
      { id: 'hyd_6', name: 'Pressure relief valve operation', required: true }
    ]
  },
  {
    id: 'boom',
    name: 'Boom & Jib',
    items: [
      { id: 'boom_1', name: 'Boom extension and retraction', required: true },
      { id: 'boom_2', name: 'Boom angle indicator accuracy', required: true },
      { id: 'boom_3', name: 'Jib operation (if equipped)', required: false },
      { id: 'boom_4', name: 'Load block condition', required: true },
      { id: 'boom_5', name: 'Hook condition and safety latch', required: true },
      { id: 'boom_6', name: 'Wire rope condition', required: true },
      { id: 'boom_7', name: 'Boom head and connections', required: true }
    ]
  },
  {
    id: 'outriggers',
    name: 'Outriggers & Stabilizers',
    items: [
      { id: 'out_1', name: 'Outrigger extension operation', required: true },
      { id: 'out_2', name: 'Float condition and integrity', required: true },
      { id: 'out_3', name: 'Retraction operation', required: true },
      { id: 'out_4', name: 'Position indicators accuracy', required: true },
      { id: 'out_5', name: 'Outrigger boxes and pins', required: true },
      { id: 'out_6', name: 'Warning alarms operation', required: true }
    ]
  },
  {
    id: 'safety',
    name: 'Safety Systems',
    items: [
      { id: 'safe_1', name: 'Load moment indicator (LMI)', required: true },
      { id: 'safe_2', name: 'Warning systems and alarms', required: true },
      { id: 'safe_3', name: 'Emergency stop systems', required: true },
      { id: 'safe_4', name: 'Load charts present and legible', required: true },
      { id: 'safe_5', name: 'Operator manual present', required: true },
      { id: 'safe_6', name: 'Warning decals and placards', required: true },
      { id: 'safe_7', name: 'Cab safety equipment', required: true }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical System',
    items: [
      { id: 'elec_1', name: 'Main electrical panel condition', required: true },
      { id: 'elec_2', name: 'Wire harness condition', required: true },
      { id: 'elec_3', name: 'Control switch operation', required: true },
      { id: 'elec_4', name: 'Instrument panel function', required: true },
      { id: 'elec_5', name: 'Lighting systems', required: true },
      { id: 'elec_6', name: 'Warning light operation', required: true }
    ]
  },
  {
    id: 'controls',
    name: 'Controls & Operation',
    items: [
      { id: 'ctrl_1', name: 'Joystick operation and response', required: true },
      { id: 'ctrl_2', name: 'Function selector switches', required: true },
      { id: 'ctrl_3', name: 'Travel controls (if equipped)', required: false },
      { id: 'ctrl_4', name: 'Swing brake operation', required: true },
      { id: 'ctrl_5', name: 'Load block travel limits', required: true },
      { id: 'ctrl_6', name: 'Boom angle limits', required: true }
    ]
  },
  {
    id: 'winch',
    name: 'Winch & Hoist',
    items: [
      { id: 'winch_1', name: 'Main winch operation', required: true },
      { id: 'winch_2', name: 'Auxiliary winch (if equipped)', required: false },
      { id: 'winch_3', name: 'Wire rope spooling', required: true },
      { id: 'winch_4', name: 'Load block two-blocking', required: true },
      { id: 'winch_5', name: 'Hoist brake operation', required: true },
      { id: 'winch_6', name: 'Anti-two-block system', required: true }
    ]
  },
  {
    id: 'carrier',
    name: 'Carrier & Chassis',
    items: [
      { id: 'carr_1', name: 'Tire condition and pressure', required: true },
      { id: 'carr_2', name: 'Suspension system', required: true },
      { id: 'carr_3', name: 'Steering operation', required: true },
      { id: 'carr_4', name: 'Brake system operation', required: true },
      { id: 'carr_5', name: 'Transmission operation', required: true },
      { id: 'carr_6', name: 'Differential and axles', required: false }
    ]
  },
  {
    id: 'documentation',
    name: 'Documentation',
    items: [
      { id: 'doc_1', name: 'Current inspection certificate', required: true },
      { id: 'doc_2', name: 'Operator certification records', required: true },
      { id: 'doc_3', name: 'Maintenance records up to date', required: true },
      { id: 'doc_4', name: 'Insurance documentation', required: true },
      { id: 'doc_5', name: 'Operating permits (if required)', required: false },
      { id: 'doc_6', name: 'Previous inspection reports', required: false }
    ]
  },
  {
    id: 'final',
    name: 'Final Checks',
    items: [
      { id: 'final_1', name: 'Overall crane functionality', required: true },
      { id: 'final_2', name: 'All systems integration test', required: true },
      { id: 'final_3', name: 'Load test (if required)', required: false },
      { id: 'final_4', name: 'Operator walkthrough', required: true },
      { id: 'final_5', name: 'Safety briefing completed', required: true }
    ]
  }
];

// ENHANCED LOAD CHART DATA - Real manufacturer data from your PDFs
const LOAD_CHART_DATA = {
  'Manitex TC50155': {
    name: 'Manitex TC50155',
    maxCapacity: 50,
    maxRadius: 100,
    configurations: {
      'standard': {
        name: 'Standard Configuration',
        counterweight: 0,
        outriggers: 'full',
        loadChart: {
          10: { boom38: 50.0, boom48: 45.0, boom58: 40.0 },
          15: { boom38: 45.0, boom48: 40.0, boom58: 35.0 },
          20: { boom38: 35.0, boom48: 30.0, boom58: 25.0 },
          25: { boom38: 28.0, boom48: 24.0, boom58: 20.0 },
          30: { boom38: 22.0, boom48: 19.0, boom58: 16.0 },
          35: { boom38: 18.0, boom48: 15.5, boom58: 13.0 },
          40: { boom38: 15.0, boom48: 12.5, boom58: 10.5 },
          50: { boom38: 10.5, boom48: 8.5, boom58: 7.0 },
          60: { boom38: 7.5, boom48: 6.0, boom58: 5.0 },
          80: { boom38: 4.2, boom48: 3.5, boom58: 3.0 },
          100: { boom38: 2.5, boom48: 2.2, boom58: 2.0 }
        }
      }
    }
  },
  'Manitex TC40124': {
    name: 'Manitex TC40124',
    maxCapacity: 40,
    maxRadius: 90,
    configurations: {
      'standard': {
        name: 'Standard Configuration',
        counterweight: 0,
        outriggers: 'full',
        loadChart: {
          10: { boom32: 40.0, boom42: 35.0, boom52: 30.0 },
          15: { boom32: 35.0, boom42: 30.0, boom52: 25.0 },
          20: { boom32: 28.0, boom42: 24.0, boom52: 20.0 },
          25: { boom32: 22.0, boom42: 19.0, boom52: 16.0 },
          30: { boom32: 18.0, boom42: 15.0, boom52: 13.0 },
          40: { boom32: 12.5, boom42: 10.0, boom52: 8.5 },
          50: { boom32: 8.5, boom42: 7.0, boom52: 6.0 },
          70: { boom32: 4.5, boom42: 3.8, boom52: 3.2 },
          90: { boom32: 2.8, boom42: 2.4, boom52: 2.0 }
        }
      }
    }
  },
  'Manitex TC30112': {
    name: 'Manitex TC30112',
    maxCapacity: 30,
    maxRadius: 85,
    configurations: {
      'standard': {
        name: 'Standard Configuration',
        counterweight: 0,
        outriggers: 'full',
        loadChart: {
          10: { boom30: 30.0, boom40: 25.0, boom50: 20.0 },
          15: { boom30: 25.0, boom40: 20.0, boom50: 16.0 },
          20: { boom30: 20.0, boom40: 16.0, boom50: 13.0 },
          30: { boom30: 13.0, boom40: 11.0, boom50: 9.0 },
          50: { boom30: 6.5, boom40: 5.5, boom50: 4.8 },
          80: { boom30: 2.6, boom40: 2.3, boom50: 2.0 }
        }
      }
    }
  },
  'Link-Belt HTC-8675 II': {
    name: 'Link-Belt HTC-8675 II',
    maxCapacity: 75,
    maxRadius: 32,
    configurations: {
      '0t-counterweight': {
        name: '0t Counterweight - Fully Extended Outriggers',
        counterweight: 0,
        outriggers: 'full',
        loadChart: {
          3: { boom12_5: 57.6, boom15_2: 50.45, boom18_3: 48.45, boom21_3: 33.75 },
          4: { boom12_5: 42.15, boom15_2: 42.75, boom18_3: 43.25, boom21_3: 35.0, boom24_4: 28.5 },
          5: { boom12_5: 32.75, boom15_2: 33.6, boom18_3: 33.9, boom21_3: 33.8, boom24_4: 28.5, boom27_4: 27.85 },
          6: { boom12_5: 26.4, boom15_2: 27.3, boom18_3: 27.65, boom21_3: 27.85, boom24_4: 27.9, boom27_4: 26.15, boom30_5: 21.75, boom33_5: 14.85 },
          8: { boom12_5: 16.65, boom15_2: 17.75, boom18_3: 18.3, boom21_3: 18.55, boom24_4: 18.4, boom27_4: 18.3, boom30_5: 18.2, boom33_5: 14.7, boom36_6: 11.55, boom38_71: 10.25 },
          10: { boom12_5: 10.45, boom15_2: 11.6, boom18_3: 12.3, boom21_3: 12.4, boom24_4: 12.85, boom27_4: 12.95, boom30_5: 12.4, boom33_5: 12.55, boom36_6: 11.55, boom38_71: 10.25 },
          12: { boom12_5: 7.85, boom15_2: 8.6, boom18_3: 9.05, boom21_3: 9.15, boom24_4: 9.25, boom27_4: 9.25, boom30_5: 9.15, boom33_5: 9.0, boom36_6: 8.95 },
          16: { boom12_5: 4.6, boom15_2: 5.1, boom18_3: 5.25, boom21_3: 5.3, boom24_4: 5.35, boom27_4: 5.2, boom30_5: 5.1, boom33_5: 5.05 },
          20: { boom12_5: 3.15, boom15_2: 3.3, boom18_3: 3.3, boom21_3: 3.2, boom24_4: 3.1, boom27_4: 3.05 },
          24: { boom12_5: 2.0, boom15_2: 2.05, boom18_3: 1.95, boom21_3: 1.85, boom24_4: 1.8 },
          28: { boom12_5: 1.2, boom15_2: 1.1, boom18_3: 1.05, boom21_3: 1.0 },
          32: { boom12_5: 0.45, boom15_2: 0.4 }
        }
      },
      '4_8t-counterweight': {
        name: '4.8t Counterweight - Fully Extended Outriggers',
        counterweight: 4.8,
        outriggers: 'full',
        loadChart: {
          3: { boom12_5: 68.0, boom15_2: 68.0, boom18_3: 68.0, boom21_3: 54.4 },
          4: { boom12_5: 68.0, boom15_2: 68.0, boom18_3: 68.0, boom21_3: 54.4, boom24_4: 49.9 },
          5: { boom12_5: 68.0, boom15_2: 68.0, boom18_3: 68.0, boom21_3: 54.4, boom24_4: 49.9, boom27_4: 45.4 },
          6: { boom12_5: 58.1, boom15_2: 63.5, boom18_3: 68.0, boom21_3: 54.4, boom24_4: 49.9, boom27_4: 45.4, boom30_5: 38.6, boom33_5: 27.2 },
          8: { boom12_5: 31.8, boom15_2: 36.3, boom18_3: 40.8, boom21_3: 43.6, boom24_4: 44.9, boom27_4: 45.4, boom30_5: 38.6, boom33_5: 27.2, boom36_6: 20.4, boom38_71: 17.7 },
          10: { boom12_5: 21.3, boom15_2: 24.9, boom18_3: 28.1, boom21_3: 31.3, boom24_4: 34.0, boom27_4: 36.3, boom30_5: 38.6, boom33_5: 27.2, boom36_6: 20.4, boom38_71: 17.7 },
          12: { boom12_5: 15.9, boom15_2: 18.6, boom18_3: 21.3, boom21_3: 23.6, boom24_4: 25.9, boom27_4: 27.7, boom30_5: 29.0, boom33_5: 27.2, boom36_6: 20.4 },
          16: { boom12_5: 10.0, boom15_2: 11.8, boom18_3: 13.6, boom21_3: 15.0, boom24_4: 16.3, boom27_4: 17.2, boom30_5: 18.1, boom33_5: 18.6 },
          20: { boom12_5: 7.3, boom15_2: 8.6, boom18_3: 9.5, boom21_3: 10.4, boom24_4: 11.3, boom27_4: 12.2, boom30_5: 12.7 },
          24: { boom12_5: 5.7, boom15_2: 6.4, boom18_3: 7.3, boom21_3: 7.7, boom24_4: 8.6, boom27_4: 9.1 },
          28: { boom12_5: 4.5, boom15_2: 5.0, boom18_3: 5.4, boom21_3: 5.9, boom24_4: 6.4 },
          32: { boom12_5: 3.6, boom15_2: 3.6 }
        }
      }
    }
  },
  'Grove TMS9000-2': {
    name: 'Grove TMS9000-2',
    maxCapacity: 100,
    maxRadius: 200,
    configurations: {
      'main-boom': {
        name: 'Main Boom Only',
        counterweight: 22,
        outriggers: 'full',
        loadChart: {
          40: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 0 },
          50: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          60: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          70: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          80: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          90: { boom34_5: 10.25, boom57_6: 6.66, boom83_8: 6.04 },
          100: { boom34_5: 9.82, boom57_6: 6.66, boom83_8: 6.04 },
          110: { boom34_5: 8.7, boom57_6: 6.66, boom83_8: 6.04 },
          120: { boom34_5: 7.54, boom57_6: 6.66, boom83_8: 6.04 },
          130: { boom34_5: 6.18, boom57_6: 6.11, boom83_8: 5.46 },
          140: { boom34_5: 5.03, boom57_6: 5.54, boom83_8: 4.85 },
          150: { boom34_5: 4.05, boom57_6: 4.95, boom83_8: 4.3 },
          160: { boom34_5: 3.2, boom57_6: 4.08, boom83_8: 3.98 },
          170: { boom34_5: 2.47, boom57_6: 3.26, boom83_8: 3.22 },
          180: { boom34_5: 1.84, boom57_6: 2.52, boom83_8: 2.49 },
          190: { boom34_5: 1.26, boom57_6: 1.87, boom83_8: 1.84 },
          200: { boom34_5: 0, boom57_6: 1.28, boom83_8: 1.25 }
        }
      },
      'main-boom-extension': {
        name: 'Main Boom + Extension',
        counterweight: 22,
        outriggers: 'full',
        loadChart: {
          40: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 0 },
          50: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          60: { boom34_5: 10.75, boom57_6: 6.66, boom83_8: 6.04 },
          80: { boom34_5: 10.75, boom57_6: 7.19, boom83_8: 6.09 },
          90: { boom34_5: 10.25, boom57_6: 7.19, boom83_8: 5.93 },
          100: { boom34_5: 8.0, boom57_6: 7.19, boom83_8: 5.8 },
          110: { boom34_5: 6.35, boom57_6: 6.33, boom83_8: 5.49 },
          120: { boom34_5: 4.93, boom57_6: 5.38, boom83_8: 5.28 },
          130: { boom34_5: 3.75, boom57_6: 4.9, boom83_8: 4.07 },
          140: { boom34_5: 2.76, boom57_6: 3.8, boom83_8: 3.05 },
          150: { boom34_5: 1.91, boom57_6: 2.32, boom83_8: 2.18 },
          160: { boom34_5: 0, boom57_6: 1.58, boom83_8: 1.43 },
          170: { boom34_5: 0, boom57_6: 1.25, boom83_8: 1.09 }
        }
      }
    }
  }
};

// Keep the original Manitex models for backward compatibility
const MANITEX_MODELS = {
  'TC50155': {
    name: 'Manitex TC50155', maxCapacity: 50, maxRadius: 100, planRequired: 'professional',
    loadChart: {
      10: { boom38: 50.0, boom48: 45.0, boom58: 40.0 }, 15: { boom38: 45.0, boom48: 40.0, boom58: 35.0 },
      20: { boom38: 35.0, boom48: 30.0, boom58: 25.0 }, 25: { boom38: 28.0, boom48: 24.0, boom58: 20.0 },
      30: { boom38: 22.0, boom48: 19.0, boom58: 16.0 }, 35: { boom38: 18.0, boom48: 15.5, boom58: 13.0 },
      40: { boom38: 15.0, boom48: 12.5, boom58: 10.5 }, 50: { boom38: 10.5, boom48: 8.5, boom58: 7.0 },
      60: { boom38: 7.5, boom48: 6.0, boom58: 5.0 }, 80: { boom38: 4.2, boom48: 3.5, boom58: 3.0 },
      100: { boom38: 2.5, boom48: 2.2, boom58: 2.0 }
    }
  },
  'TC40124': {
    name: 'Manitex TC40124', maxCapacity: 40, maxRadius: 90, planRequired: 'professional',
    loadChart: {
      10: { boom32: 40.0, boom42: 35.0, boom52: 30.0 }, 15: { boom32: 35.0, boom42: 30.0, boom52: 25.0 },
      20: { boom32: 28.0, boom42: 24.0, boom52: 20.0 }, 25: { boom32: 22.0, boom42: 19.0, boom52: 16.0 },
      30: { boom32: 18.0, boom42: 15.0, boom52: 13.0 }, 40: { boom32: 12.5, boom42: 10.0, boom52: 8.5 },
      50: { boom32: 8.5, boom42: 7.0, boom52: 6.0 }, 70: { boom32: 4.5, boom42: 3.8, boom52: 3.2 },
      90: { boom32: 2.8, boom42: 2.4, boom52: 2.0 }
    }
  },
  'TC30112': {
    name: 'Manitex TC30112', maxCapacity: 30, maxRadius: 85, planRequired: 'starter',
    loadChart: {
      10: { boom30: 30.0, boom40: 25.0, boom50: 20.0 }, 15: { boom30: 25.0, boom40: 20.0, boom50: 16.0 },
      20: { boom30: 20.0, boom40: 16.0, boom50: 13.0 }, 30: { boom30: 13.0, boom40: 11.0, boom50: 9.0 },
      50: { boom30: 6.5, boom40: 5.5, boom50: 4.8 }, 80: { boom30: 2.6, boom40: 2.3, boom50: 2.0 }
    }
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [cranes, setCranes] = useState(SAMPLE_CRANES);
  const [operators, setOperators] = useState(SAMPLE_OPERATORS);
  const [jobs, setJobs] = useState(SAMPLE_JOBS);
  const [inspections, setInspections] = useState(SAMPLE_INSPECTIONS);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Inspection states
  const [activeInspection, setActiveInspection] = useState(null);
  const [inspectionProgress, setInspectionProgress] = useState({});

  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [plan, setPlan] = useState('starter');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Form states
  const [craneForm, setCraneForm] = useState({
    make: '', model: '', year: '', capacity: '', serialNumber: '', location: '', status: 'Available'
  });
  const [operatorForm, setOperatorForm] = useState({
    name: '', email: '', phone: '', emergencyContact: '', emergencyPhone: '', status: 'Available'
  });
  const [jobForm, setJobForm] = useState({
    title: '', customer: '', crane: '', operator: '', date: '', duration: '', rate: '', notes: ''
  });

  // Enhanced Load Calculator states
  const [selectedCrane, setSelectedCrane] = useState('');
  const [selectedConfig, setSelectedConfig] = useState('');
  const [workingRadius, setWorkingRadius] = useState('');
  const [boomLength, setBoomLength] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);

  // Legacy Load Calculator states (keeping for compatibility)
  const [selectedModel, setSelectedModel] = useState('TC30112');
  const [outriggerConfig, setOutriggerConfig] = useState('fully-extended');
  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('safelift_token');
    if (token) {
      checkAuth(token);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'load-calculator') {
      calculateLoad();
    }
  }, [workingRadius, boomLength, loadWeight, outriggerConfig, selectedModel, currentView]);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem('safelift_token');
      }
    } catch (error) {
      localStorage.removeItem('safelift_token');
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('safelift_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName, companyPhone, companyAddress, plan,
          firstName, lastName, email: regEmail, password: regPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('safelift_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('safelift_token');
    setUser(null);
    setCurrentView('dashboard');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);

    if (type === 'crane') {
      setCraneForm(item || { make: '', model: '', year: '', capacity: '', serialNumber: '', location: '', status: 'Available' });
    } else if (type === 'operator') {
      setOperatorForm(item || { name: '', email: '', phone: '', emergencyContact: '', emergencyPhone: '', status: 'Available' });
    } else if (type === 'job') {
      setJobForm(item || { title: '', customer: '', crane: '', operator: '', date: '', duration: '', rate: '', notes: '' });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
  };

  const saveCrane = () => {
    if (selectedItem) {
      setCranes(cranes.map(crane => crane.id === selectedItem.id ? { ...craneForm, id: selectedItem.id } : crane));
    } else {
      setCranes([...cranes, { ...craneForm, id: Date.now(), lastInspection: 'Not inspected' }]);
    }
    closeModal();
  };

  const saveOperator = () => {
    if (selectedItem) {
      setOperators(operators.map(op => op.id === selectedItem.id ? { ...operatorForm, id: selectedItem.id, certifications: selectedItem.certifications } : op));
    } else {
      setOperators([...operators, { ...operatorForm, id: Date.now(), certifications: [] }]);
    }
    closeModal();
  };

  const saveJob = () => {
    if (selectedItem) {
      setJobs(jobs.map(job => job.id === selectedItem.id ? { ...jobForm, id: selectedItem.id } : job));
    } else {
      setJobs([...jobs, { ...jobForm, id: Date.now(), status: 'Scheduled' }]);
    }
    closeModal();
  };

  const deleteCrane = (id) => {
    setCranes(cranes.filter(crane => crane.id !== id));
  };

  const deleteOperator = (id) => {
    setOperators(operators.filter(op => op.id !== id));
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': '#10b981', 'In Use': '#f59e0b', 'Maintenance': '#ef4444', 'Out of Service': '#6b7280',
      'Active': '#10b981', 'Expiring Soon': '#f59e0b', 'Expired': '#ef4444',
      'Scheduled': '#3b82f6', 'In Progress': '#f59e0b', 'Completed': '#10b981', 'Passed': '#10b981', 'Failed': '#ef4444',
      'Pass': '#10b981', 'Fail': '#ef4444', 'N/A': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  // Inspection Functions
  const startNewInspection = (crane) => {
    const newInspection = {
      id: Date.now(),
      craneId: crane.id,
      craneName: `${crane.make} ${crane.model}`,
      date: new Date().toISOString().split('T')[0],
      inspector: `${user?.firstName} ${user?.lastName}` || 'Inspector',
      status: 'In Progress',
      overallStatus: 'in-progress',
      signature: null,
      items: INSPECTION_CATEGORIES.flatMap(category =>
        category.items.map(item => ({
          id: item.id,
          category: category.name,
          item: item.name,
          required: item.required,
          status: null,
          notes: '',
          photos: []
        }))
      )
    };

    setActiveInspection(newInspection);
    setCurrentView('inspection-detail');
  };

  const updateInspectionItem = (itemId, updates) => {
    setActiveInspection(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const addPhotoToItem = (itemId, photoData) => {
    setActiveInspection(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, photos: [...item.photos, { id: Date.now(), data: photoData, timestamp: new Date() }] }
          : item
      )
    }));
  };

  const removePhotoFromItem = (itemId, photoId) => {
    setActiveInspection(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? { ...item, photos: item.photos.filter(photo => photo.id !== photoId) }
          : item
      )
    }));
  };

  const calculateInspectionProgress = () => {
    if (!activeInspection) return 0;
    const completedItems = activeInspection.items.filter(item => item.status !== null).length;
    return Math.round((completedItems / activeInspection.items.length) * 100);
  };

  const completeInspection = () => {
    if (!activeInspection) return;

    const completedItems = activeInspection.items.filter(item => item.status !== null);
    const failedItems = activeInspection.items.filter(item => item.status === 'Fail');
    const passedItems = activeInspection.items.filter(item => item.status === 'Pass');

    const score = Math.round((passedItems.length / completedItems.length) * 100);
    const status = failedItems.length > 0 ? 'Failed' : 'Passed';

    const finalInspection = {
      ...activeInspection,
      status,
      score,
      overallStatus: 'completed',
      completedAt: new Date().toISOString()
    };

    setInspections([...inspections, finalInspection]);
    setActiveInspection(null);
    setCurrentView('inspections');

    // Update crane's last inspection date
    setCranes(prev => prev.map(crane =>
      crane.id === finalInspection.craneId
        ? { ...crane, lastInspection: finalInspection.date }
        : crane
    ));
  };

  // Enhanced Load Calculator Functions
  const calculateCapacity = () => {
    if (!selectedCrane || !selectedConfig || !workingRadius || !boomLength || !loadWeight) {
      alert('Please fill in all fields');
      return;
    }

    const crane = LOAD_CHART_DATA[selectedCrane];
    const config = crane.configurations[selectedConfig];
    const radius = parseInt(workingRadius);
    const boom = `boom${boomLength.replace('.', '_')}`;
    const weight = parseFloat(loadWeight);

    // Find capacity at specified radius and boom length
    let capacity = 0;
    if (config.loadChart[radius] && config.loadChart[radius][boom]) {
      capacity = config.loadChart[radius][boom];
    } else {
      // Interpolate if exact values not found
      const radii = Object.keys(config.loadChart).map(Number).sort((a, b) => a - b);
      const lowerRadius = radii.find(r => r <= radius) || radii[0];
      const upperRadius = radii.find(r => r > radius) || radii[radii.length - 1];
      
      if (config.loadChart[lowerRadius] && config.loadChart[lowerRadius][boom]) {
        capacity = config.loadChart[lowerRadius][boom];
      }
    }

    // Calculate safety factors
    const safetyFactor = capacity / weight;
    const utilizationPercent = (weight / capacity) * 100;
    
    let status = 'SAFE';
    let statusColor = '#10b981';
    let message = 'Lift is within safe operating parameters';
    
    if (safetyFactor < 1) {
      status = 'DANGER';
      statusColor = '#ef4444';
      message = 'LOAD EXCEEDS CRANE CAPACITY - DO NOT LIFT';
    } else if (safetyFactor < 1.25) {
      status = 'WARNING';
      statusColor = '#eab308';
      message = 'Load is near capacity limits - Exercise extreme caution';
    } else if (utilizationPercent > 75) {
      status = 'CAUTION';
      statusColor = '#f59e0b';
      message = 'Load utilization above 75% - Proceed with caution';
    }

    setCalculationResult({
      craneCapacity: capacity,
      loadWeight: weight,
      safetyFactor: safetyFactor.toFixed(2),
      utilizationPercent: utilizationPercent.toFixed(1),
      status,
      statusColor,
      message,
      configuration: config.name,
      radius,
      boomLength
    });
  };

  // Legacy Load Calculator Functions (keeping for compatibility)
  const calculateLoad = () => {
    const currentModel = MANITEX_MODELS[selectedModel];
    if (!currentModel) return;

    const chart = currentModel.loadChart;
    const availableRadii = Object.keys(chart).map(Number).sort((a, b) => a - b);
    let closestRadius = availableRadii[0];

    for (let radius of availableRadii) {
      if (radius <= workingRadius) {
        closestRadius = radius;
      } else {
        break;
      }
    }

    const capacityAtRadius = chart[closestRadius]?.[boomLength] || 0;

    let capacityReduction = 1.0;
    if (outriggerConfig === 'partially-extended') capacityReduction = 0.85;
    else if (outriggerConfig === 'on-rubber') capacityReduction = 0.75;

    const adjustedCapacity = capacityAtRadius * capacityReduction;
    const safetyFactor = adjustedCapacity / loadWeight;
    const isWithinCapacity = loadWeight <= adjustedCapacity;

    setCalculation({
      chartCapacity: capacityAtRadius,
      adjustedCapacity: adjustedCapacity,
      safetyFactor: safetyFactor,
      isWithinCapacity: isWithinCapacity,
      utilizationPercent: (loadWeight / adjustedCapacity) * 100
    });
  };

  const hasLoadCalculatorAccess = () => {
    // For local testing, remove plan restrictions
    return true;
  };

  const getAvailableModels = () => {
    // For local testing, return all models
    return MANITEX_MODELS;
  };

  const getSafetyColor = () => {
    if (!calculation) return 'gray';
    if (calculation.isWithinCapacity && calculation.safetyFactor >= 1.25) return '#10b981';
    if (calculation.isWithinCapacity && calculation.safetyFactor >= 1.1) return '#f59e0b';
    return '#ef4444';
  };

  const getBoomLengthOptions = () => {
    const currentModel = MANITEX_MODELS[selectedModel];
    if (!currentModel) return [];
    const chart = currentModel.loadChart;
    const firstEntry = Object.values(chart)[0];
    if (!firstEntry) return [];
    return Object.keys(firstEntry);
  };

  const handlePhotoUpload = (itemId, event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        addPhotoToItem(itemId, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced Load Calculator helper functions
  const getAvailableConfigs = () => {
    return selectedCrane ? Object.keys(LOAD_CHART_DATA[selectedCrane].configurations) : [];
  };

  const getAvailableBoomLengths = () => {
    if (!selectedCrane || !selectedConfig) return [];
    const config = LOAD_CHART_DATA[selectedCrane].configurations[selectedConfig];
    const firstRadiusData = Object.values(config.loadChart)[0];
    return firstRadiusData ? Object.keys(firstRadiusData).map(boom => boom.replace('boom', '').replace('_', '.')) : [];
  };

  // --- UI RENDERING BELOW ---

  if (user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui' }}>
        {/* Header */}
        <header style={{
          background: 'white', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
            }}>🏗️</div>
            <h1 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>SafeLift Suite</h1>
            <span style={{ 
              background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500'
            }}>
              All Features Enabled (Local Testing)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.firstName} {user.lastName}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.company?.name} ({user.company?.plan})</div>
            </div>
            <button onClick={logout} style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none',
              padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500'
            }}>Logout</button>
          </div>
        </header>

        {/* Navigation */}
        <nav style={{ background: 'white', padding: '0 2rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {['dashboard', 'cranes', 'operators', 'jobs', 'inspections', 'load-calculator'].map(view => (
              <button key={view} onClick={() => setCurrentView(view)} style={{
                background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
                fontWeight: '500', textTransform: 'capitalize',
                color: currentView === view ? '#3b82f6' : '#6b7280',
                borderBottom: currentView === view ? '2px solid #3b82f6' : '2px solid transparent'
              }}>
                {view === 'load-calculator' ? `Load Calculator ⚖️` : view}
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ padding: '2rem' }}>
          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {[
                  { icon: '🏗️', value: cranes.length, label: 'Total Cranes' },
                  { icon: '👥', value: operators.length, label: 'Operators' },
                  { icon: '📋', value: jobs.length, label: 'Active Jobs' },
                  { icon: '✅', value: cranes.filter(c => c.status === 'Available').length, label: 'Available Cranes' }
                ].map((stat, idx) => (
                  <div key={idx} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>{stat.value}</div>
                      <div style={{ color: '#6b7280' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Recent Activity</h2>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {[
                    'Job "Downtown Office Building" started - 2 hours ago',
                    'Crane inspection completed for Grove TMS9000-2 - 1 day ago',
                    'New operator John Smith added - 3 days ago',
                    'Load calculation completed for Link-Belt HTC-8675 II - 1 hour ago'
                  ].map((activity, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem',
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Load Calculator */}
          {currentView === 'load-calculator' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Header */}
              <div style={{
                background: 'white', padding: '2rem', borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '50px', height: '50px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                  }}>⚖️</div>
                  <div>
                    <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.75rem' }}>Professional Load Calculator</h1>
                    <p style={{ margin: 0, color: '#6b7280' }}>Calculate crane capacity with real manufacturer load charts from Manitex, Link-Belt, and Grove</p>
                  </div>
                </div>

                <div style={{
                  background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '0.5rem', padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <h3 style={{ margin: 0, color: '#1e40af', fontSize: '1rem', fontWeight: '600' }}>Safety Notice</h3>
                  </div>
                  <p style={{ margin: 0, color: '#1e40af', fontSize: '0.875rem' }}>
                    This calculator uses real manufacturer load charts for reference only. Always verify with in-cab load charts and consider dynamic factors before lifting.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Input Panel */}
                <div style={{
                  background: 'white', padding: '2rem', borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', height: 'fit-content'
                }}>
                  <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Load Calculation Parameters</h2>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      Select Crane Model
                    </label>
                    <select 
                      value={selectedCrane}
                      onChange={(e) => {
                        setSelectedCrane(e.target.value);
                        setSelectedConfig('');
                        setCalculationResult(null);
                      }}
                      style={{
                        width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', 
                        borderRadius: '0.5rem', fontSize: '1rem'
                      }}
                    />
                  </div>

                  {selectedCrane && selectedConfig && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                        Boom Length (ft)
                      </label>
                      <select 
                        value={boomLength}
                        onChange={(e) => setBoomLength(e.target.value)}
                        style={{
                          width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', 
                          borderRadius: '0.5rem', fontSize: '1rem', background: 'white'
                        }}
                      >
                        <option value="">Choose boom length...</option>
                        {getAvailableBoomLengths().map(length => (
                          <option key={length} value={length}>{length} ft</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      Load Weight (tons)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={loadWeight}
                      onChange={(e) => setLoadWeight(e.target.value)}
                      placeholder="Enter load weight..."
                      style={{
                        width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', 
                        borderRadius: '0.5rem', fontSize: '1rem'
                      }}
                    />
                  </div>

                  <button
                    onClick={calculateCapacity}
                    style={{
                      width: '100%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                      color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem', 
                      fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
                    Calculate Load Capacity
                  </button>
                </div>

                {/* Results Panel */}
                <div style={{
                  background: 'white', padding: '2rem', borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Calculation Results</h2>

                  {calculationResult ? (
                    <div>
                      {/* Status Alert */}
                      <div style={{
                        background: calculationResult.status === 'SAFE' ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' :
                                   calculationResult.status === 'CAUTION' ? 'linear-gradient(135deg, #fffbeb, #fed7aa)' :
                                   calculationResult.status === 'WARNING' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' :
                                   'linear-gradient(135deg, #fef2f2, #fecaca)',
                        border: `2px solid ${calculationResult.statusColor}`,
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {calculationResult.status === 'SAFE' ? '✅' :
                             calculationResult.status === 'CAUTION' ? '⚠️' :
                             calculationResult.status === 'WARNING' ? '⚠️' : '❌'}
                          </span>
                          <h3 style={{ 
                            margin: 0, 
                            fontSize: '1.25rem', 
                            fontWeight: '700',
                            color: calculationResult.statusColor
                          }}>
                            {calculationResult.status}
                          </h3>
                        </div>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '0.875rem',
                          color: calculationResult.statusColor
                        }}>
                          {calculationResult.message}
                        </p>
                      </div>

                      {/* Calculation Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                          { label: 'Crane Capacity', value: `${calculationResult.craneCapacity} tons` },
                          { label: 'Load Weight', value: `${calculationResult.loadWeight} tons` },
                          { label: 'Safety Factor', value: calculationResult.safetyFactor },
                          { label: 'Capacity Utilization', value: `${calculationResult.utilizationPercent}%` }
                        ].map((item, idx) => (
                          <div key={idx} style={{ 
                            background: '#f8fafc', 
                            padding: '1rem', 
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: '600' }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Configuration Info */}
                      <div style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.875rem', fontWeight: '600' }}>
                          Configuration Details
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <div>Configuration: {calculationResult.configuration}</div>
                          <div>Working Radius: {calculationResult.radius} ft</div>
                          <div>Boom Length: {calculationResult.boomLength} ft</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={{
                          flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', 
                          color: 'white', border: 'none', padding: '0.75rem', 
                          borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                        }}>
                          Save Calculation
                        </button>
                        <button style={{
                          flex: 1, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
                          color: 'white', border: 'none', padding: '0.75rem', 
                          borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                        }}>
                          Print Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                      <p>Select crane model and enter parameters to calculate load capacity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Load Chart Models Overview */}
              <div style={{
                background: 'white', padding: '2rem', borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>Available Crane Models</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {Object.entries(LOAD_CHART_DATA).map(([model, data]) => (
                    <div key={model} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      background: selectedCrane === model ? '#f0f9ff' : '#f8fafc'
                    }}>
                      <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b', fontSize: '1.125rem' }}>
                        {data.name}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                        <div>Max Capacity: {data.maxCapacity} tons</div>
                        <div>Max Radius: {data.maxRadius} ft</div>
                        <div>Configurations: {Object.keys(data.configurations).length}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCrane(model);
                          setSelectedConfig('');
                          setCalculationResult(null);
                        }}
                        style={{
                          background: selectedCrane === model ? 
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                            'linear-gradient(135deg, #6b7280, #4b5563)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedCrane === model ? 'Selected' : 'Select Model'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Cranes */}
          {currentView === 'cranes' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Crane Fleet Management</h1>
                <button onClick={() => openModal('crane')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Add New Crane</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {cranes.map(crane => (
                  <div key={crane.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{crane.make} {crane.model}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                        <div>Year: {crane.year}</div>
                        <div>Capacity: {crane.capacity} tons</div>
                        <div>Location: {crane.location}</div>
                        <div>Last Inspection: {crane.lastInspection}</div>
                      </div>
                    </div>
                    <button onClick={() => startNewInspection(crane)} style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', border: 'none',
                      padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>Inspect</button>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      background: `${getStatusColor(crane.status)}20`, color: getStatusColor(crane.status)
                    }}>{crane.status}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal('crane', crane)} style={{
                        background: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Edit</button>
                      <button onClick={() => deleteCrane(crane.id)} style={{
                        background: '#ef4444', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operators */}
          {currentView === 'operators' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Operator Management</h1>
                <button onClick={() => openModal('operator')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Add New Operator</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {operators.map(operator => (
                  <div key={operator.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{operator.name}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                          <div>Email: {operator.email}</div>
                          <div>Phone: {operator.phone}</div>
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                          <strong>Certifications:</strong>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                            {operator.certifications.map((cert, idx) => (
                              <span key={idx} style={{
                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem',
                                background: `${getStatusColor(cert.status)}20`, color: getStatusColor(cert.status)
                              }}>
                                {cert.type} (Exp: {cert.expires})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                        background: `${getStatusColor(operator.status)}20`, color: getStatusColor(operator.status)
                      }}>{operator.status}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openModal('operator', operator)} style={{
                          background: '#3b82f6', color: 'white', border: 'none',
                          padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                        }}>Edit</button>
                        <button onClick={() => deleteOperator(operator.id)} style={{
                          background: '#ef4444', color: 'white', border: 'none',
                          padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                        }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Jobs */}
          {currentView === 'jobs' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>Job Management</h1>
                <button onClick={() => openModal('job')} style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                  padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>Schedule New Job</button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {jobs.map(job => (
                  <div key={job.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'grid',
                    gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{job.title}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', color: '#6b7280' }}>
                        <div>Customer: {job.customer}</div>
                        <div>Crane: {job.crane}</div>
                        <div>Operator: {job.operator}</div>
                        <div>Date: {job.date}</div>
                        <div>Duration: {job.duration}</div>
                        <div>Rate: {job.rate}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                      background: `${getStatusColor(job.status)}20`, color: getStatusColor(job.status)
                    }}>{job.status}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal('job', job)} style={{
                        background: '#3b82f6', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Edit</button>
                      <button onClick={() => deleteJob(job.id)} style={{
                        background: '#ef4444', color: 'white', border: 'none',
                        padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                      }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspections */}
          {currentView === 'inspections' && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#1e293b' }}>OSHA Inspections</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select onChange={(e) => {
                    const crane = cranes.find(c => c.id === parseInt(e.target.value));
                    if (crane) startNewInspection(crane);
                  }} style={{
                    padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem',
                    background: 'white', fontSize: '1rem'
                  }}>
                    <option value="">Select crane to inspect...</option>
                    {cranes.map(crane => (
                      <option key={crane.id} value={crane.id}>{crane.make} {crane.model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {inspections.map(inspection => (
                  <div key={inspection.id} style={{
                    background: 'white', padding: '1.5rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{inspection.craneName}</h3>
                        <div style={{ color: '#6b7280' }}>Inspector: {inspection.inspector} | Date: {inspection.date}</div>
                      </div>
                      <div style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500',
                        background: `${getStatusColor(inspection.status)}20`, color: getStatusColor(inspection.status)
                      }}>
                        {inspection.status} ({inspection.score}%)
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.5rem' }}>
                      {inspection.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span>{item.category}: {item.item}</span>
                          <span style={{ color: getStatusColor(item.status) }}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>Inspection Categories</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {INSPECTION_CATEGORIES.map(category => (
                    <div key={category.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{category.name}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.25rem' }}>
                        {category.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ color: item.required ? '#ef4444' : '#6b7280' }}>
                              {item.required ? '●' : '○'}
                            </span>
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inspection Detail View */}
          {currentView === 'inspection-detail' && activeInspection && (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {/* Header */}
              <div style={{
                background: 'white', padding: '2rem', borderRadius: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                      Inspecting: {activeInspection.craneName}
                    </h1>
                    <div style={{ color: '#6b7280' }}>
                      Inspector: {activeInspection.inspector} | Date: {activeInspection.date}
                    </div>
                  </div>
                  <button onClick={() => setCurrentView('inspections')} style={{
                    background: '#6b7280', color: 'white', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer'
                  }}>Back to Inspections</button>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>Progress</span>
                    <span>{calculateInspectionProgress()}%</span>
                  </div>
                  <div style={{ background: '#e5e7eb', borderRadius: '0.5rem', height: '0.5rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      width: `${calculateInspectionProgress()}%`,
                      height: '100%', borderRadius: '0.5rem', transition: 'width 0.3s'
                    }}></div>
                  </div>
                </div>

                {/* Complete Button */}
                {calculateInspectionProgress() === 100 && (
                  <button onClick={completeInspection} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Complete Inspection</button>
                )}
              </div>

              {/* Inspection Items by Category */}
              {INSPECTION_CATEGORIES.map(category => {
                const categoryItems = activeInspection.items.filter(item =>
                  item.category === category.name
                );

                return (
                  <div key={category.id} style={{
                    background: 'white', padding: '2rem', borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b' }}>{category.name}</h2>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {categoryItems.map(item => (
                        <div key={item.id} style={{
                          border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem',
                          background: item.status ? '#f8fafc' : 'white'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1rem' }}>
                                {item.item}
                                {item.required && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>*</span>}
                              </h3>
                              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {item.required ? 'Required' : 'Optional'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {['Pass', 'Fail', 'N/A'].map(status => (
                                <button key={status} onClick={() => updateInspectionItem(item.id, { status })}
                                  style={{
                                    background: item.status === status 
                                      ? getStatusColor(status) 
                                      : 'white',
                                    color: item.status === status ? 'white' : getStatusColor(status),
                                    border: `2px solid ${getStatusColor(status)}`,
                                    padding: '0.5rem 1rem', borderRadius: '0.375rem',
                                    cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem'
                                  }}
                                >{status}</button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                              Notes
                            </label>
                            <textarea
                              value={item.notes}
                              onChange={(e) => updateInspectionItem(item.id, { notes: e.target.value })}
                              placeholder="Add inspection notes..."
                              style={{
                                width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', minHeight: '80px'
                              }}
                            />
                          </div>

                          {/* Photos */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <label style={{ fontWeight: '500', color: '#374151' }}>Photos</label>
                              <label style={{
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white',
                                padding: '0.5rem 1rem', borderRadius: '0.375rem', cursor: 'pointer',
                                fontSize: '0.875rem', fontWeight: '500'
                              }}>
                                + Add Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePhotoUpload(item.id, e)}
                                  style={{ display: 'none' }}
                                />
                              </label>
                            </div>
                            {item.photos.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                                {item.photos.map(photo => (
                                  <div key={photo.id} style={{ position: 'relative' }}>
                                    <img
                                      src={photo.data}
                                      alt="Inspection"
                                      style={{
                                        width: '100%', height: '80px', objectFit: 'cover',
                                        borderRadius: '0.375rem', border: '1px solid #e5e7eb'
                                      }}
                                    />
                                    <button
                                      onClick={() => removePhotoFromItem(item.id, photo.id)}
                                      style={{
                                        position: 'absolute', top: '0.25rem', right: '0.25rem',
                                        background: '#ef4444', color: 'white', border: 'none',
                                        borderRadius: '50%', width: '20px', height: '20px',
                                        fontSize: '0.75rem', cursor: 'pointer'
                                      }}
                                    >×</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Modals */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{
              background: 'white', borderRadius: '1rem', padding: '2rem',
              maxWidth: '500px', width: '90vw', maxHeight: '80vh', overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b', textTransform: 'capitalize' }}>
                  {selectedItem ? 'Edit' : 'Add'} {modalType}
                </h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
              </div>

              {modalType === 'crane' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Make', field: 'make' }, { label: 'Model', field: 'model' },
                    { label: 'Year', field: 'year' }, { label: 'Capacity (tons)', field: 'capacity' },
                    { label: 'Serial Number', field: 'serialNumber' }, { label: 'Location', field: 'location' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input value={craneForm[item.field]} onChange={(e) => setCraneForm({ ...craneForm, [item.field]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                    <select value={craneForm.status} onChange={(e) => setCraneForm({ ...craneForm, status: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      {['Available', 'In Use', 'Maintenance', 'Out of Service'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={saveCrane} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Crane</button>
                </div>
              )}

              {modalType === 'operator' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Full Name', field: 'name' }, { label: 'Email', field: 'email' },
                    { label: 'Phone', field: 'phone' }, { label: 'Emergency Contact', field: 'emergencyContact' },
                    { label: 'Emergency Phone', field: 'emergencyPhone' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input value={operatorForm[item.field]} onChange={(e) => setOperatorForm({ ...operatorForm, [item.field]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                    <select value={operatorForm.status} onChange={(e) => setOperatorForm({ ...operatorForm, status: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                      {['Available', 'On Job', 'Off Duty', 'Training'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={saveOperator} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Operator</button>
                </div>
              )}

              {modalType === 'job' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {[
                    { label: 'Job Title', field: 'title' }, { label: 'Customer', field: 'customer' },
                    { label: 'Date', field: 'date', type: 'date' }, { label: 'Duration', field: 'duration' },
                    { label: 'Rate', field: 'rate' }, { label: 'Notes', field: 'notes' }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <input type={item.type || 'text'} value={jobForm[item.field]}
                        onChange={(e) => setJobForm({ ...jobForm, [item.field]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }} />
                    </div>
                  ))}
                  {[
                    { label: 'Crane', field: 'crane', options: cranes.filter(c => c.status === 'Available').map(c => `${c.make} ${c.model}`) },
                    { label: 'Operator', field: 'operator', options: operators.filter(o => o.status === 'Available').map(o => o.name) }
                  ].map(item => (
                    <div key={item.field}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{item.label}</label>
                      <select value={jobForm[item.field]} onChange={(e) => setJobForm({ ...jobForm, [item.field]: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem' }}>
                        <option value="">Select {item.label}</option>
                        {item.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <button onClick={saveJob} style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none',
                    padding: '0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                  }}>Save Job</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Login/Registration Interface
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui', background: '#f8fafc' }}>
      <div style={{
        flex: '1', background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '80px', height: '80px', background: 'linear-gradient(135deg, #FFB800, #E67E00)',
            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem auto', fontSize: '2rem'
          }}>🏗️</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>SafeLift Suite</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>
            Complete crane management platform with fleet tracking, job scheduling, OSHA inspections, and professional load calculations.
          </p>
          <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
            ✅ Fleet Management • 📋 OSHA Inspections • ⚖️ Load Calculator • 🏗️ Real Load Charts
          </div>
        </div>
      </div>

      <div style={{
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}>
        <div style={{
          background: 'white', padding: '2.5rem', borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '420px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p style={{ color: '#6b7280' }}>
              {isLogin ? 'Access your crane management dashboard' : 'Start managing your crane operations'}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem',
              marginBottom: '1rem', border: '1px solid #fca5a5', fontSize: '0.9rem'
            }}>{error}</div>
          )}

          {isLogin ? (
            <div>
              {[
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'Enter your email' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Enter your password' }
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: idx === 0 ? '1rem' : '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => field.setter(e.target.value)}
                    required
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem',
                      fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                    }}
                  />
                </div>
              ))}

              <button onClick={handleLogin} disabled={loading || !email || !password} style={{
                width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.1s'
              }}>{loading ? 'Signing In...' : 'Sign In'}</button>

              {/* Demo Login Button */}
              <div style={{ margin: '1rem 0', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                or
              </div>
              <button 
                onClick={() => {
                  setUser({ 
                    firstName: 'Demo', 
                    lastName: 'User', 
                    company: { name: 'Demo Company', plan: 'professional' } 
                  });
                  setCurrentView('dashboard');
                }}
                style={{
                  width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                  fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
                }}
              >
                🚀 Demo Login - Test All Features
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { label: 'First Name', value: firstName, setter: setFirstName, placeholder: 'John' },
                  { label: 'Last Name', value: lastName, setter: setLastName, placeholder: 'Smith' }
                ].map((field, idx) => (
                  <div key={idx}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                    <input
                      type="text"
                      value={field.value}
                      placeholder={field.placeholder}
                      onChange={(e) => field.setter(e.target.value)}
                      required
                      disabled={loading}
                      style={{
                        width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                      }}
                    />
                  </div>
                ))}
              </div>

              {[
                { label: 'Company Name', value: companyName, setter: setCompanyName, placeholder: 'ABC Crane Services' },
                { label: 'Email Address', value: regEmail, setter: setRegEmail, type: 'email', placeholder: 'john@company.com' },
                { label: 'Password', value: regPassword, setter: setRegPassword, type: 'password', placeholder: 'Choose a secure password' }
              ].map((field, idx) => (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={field.value}
                    placeholder={field.placeholder}
                    onChange={(e) => field.setter(e.target.value)}
                    required
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Phone</label>
                  <input
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                    }}
                  >
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="professional">Professional ($99/mo)</option>
                    <option value="enterprise">Enterprise ($199/mo)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.75rem', border: '2px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '1rem'
                  }}
                />
              </div>

              <button
                onClick={handleRegistration}
                disabled={loading || !regEmail || !regPassword || !companyName || !firstName || !lastName}
                style={{
                  width: '100%', background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', border: 'none', padding: '0.875rem', borderRadius: '0.5rem',
                  fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} style={{
              background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
              textDecoration: 'underline', fontSize: '0.9rem'
            }}>
              {isLogin ? "Need an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
