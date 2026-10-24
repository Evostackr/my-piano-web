import { EntityNode, TopicClusterNode } from './types';

/**
 * Entity Graph and Topical Authority Cluster Architecture
 */

export const ENTITY_GRAPH: EntityNode[] = [
  {
    id: 'entity-evostackr',
    name: 'Evostackr',
    type: 'Organization',
    description: 'Technology developer and software organization engineering accessible web audio instruments.',
    sameAs: ['https://github.com/Evostackr', 'https://evostackr.in'],
    relationships: [
      { relation: 'developerOf', targetId: 'entity-my-piano' },
      { relation: 'contactPoint', targetId: 'support@evostackr.in' }
    ]
  },
  {
    id: 'entity-my-piano',
    name: 'My Piano Online',
    type: 'SoftwareApplication / WebApplication',
    description: 'Free interactive 88-key virtual piano web app with 7 octaves, zero latency, and authentic acoustic grand piano recordings.',
    relationships: [
      { relation: 'instrumentType', targetId: 'entity-acoustic-piano' },
      { relation: 'poweredBy', targetId: 'entity-web-audio-api' },
      { relation: 'developedBy', targetId: 'entity-evostackr' }
    ]
  },
  {
    id: 'entity-acoustic-piano',
    name: 'Acoustic Grand Piano',
    type: 'MusicalInstrument',
    description: 'Keyboard instrument generating acoustic sound by striking metal strings with felt hammers across 88 pitches (A0 to C8).',
    relationships: [
      { relation: 'referenceNote', targetId: 'entity-middle-c' },
      { relation: 'modeledIn', targetId: 'entity-my-piano' }
    ]
  },
  {
    id: 'entity-middle-c',
    name: 'Middle C (C4)',
    type: 'MusicalPitch',
    description: 'The standard acoustic reference note at 261.63 Hz, located near the center of an 88-key piano keyboard.',
    relationships: [
      { relation: 'pitchOf', targetId: 'entity-acoustic-piano' }
    ]
  },
  {
    id: 'entity-web-audio-api',
    name: 'Web Audio API',
    type: 'ComputingPlatform / WebStandard',
    description: 'High-level browser JavaScript system for controlling audio on the web, supporting polyphonic synthesis and audio buffering.',
    relationships: [
      { relation: 'audioEngineOf', targetId: 'entity-my-piano' }
    ]
  }
];

export const TOPIC_CLUSTERS: TopicClusterNode[] = [
  {
    id: 'topic-pillar',
    title: 'Virtual Piano & Browser Music Synthesis',
    type: 'PILLAR',
    url: 'https://my-piano.evostackr.in/',
    searchIntent: 'TRANSACTIONAL',
    coverageScore: 95
  },
  {
    id: 'subtopic-keyboard-layout',
    title: '88-Key Piano Layout & Navigation',
    type: 'SUBTOPIC',
    url: 'https://my-piano.evostackr.in/#play',
    searchIntent: 'INFORMATIONAL',
    coverageScore: 92,
    parentTopicId: 'topic-pillar'
  },
  {
    id: 'subtopic-middle-c',
    title: 'Finding Middle C (C4) & Note Intervals',
    type: 'SUBTOPIC',
    url: 'https://my-piano.evostackr.in/#piano-guide',
    searchIntent: 'INFORMATIONAL',
    coverageScore: 88,
    parentTopicId: 'topic-pillar'
  },
  {
    id: 'subtopic-computer-keys',
    title: 'QWERTY Computer Keyboard Controls',
    type: 'SUBTOPIC',
    url: 'https://my-piano.evostackr.in/#how-to-play',
    searchIntent: 'TRANSACTIONAL',
    coverageScore: 90,
    parentTopicId: 'topic-pillar'
  },
  {
    id: 'subtopic-acoustic-samples',
    title: 'Acoustic Sound Sample Timbre & Polyphony',
    type: 'SUBTOPIC',
    url: 'https://my-piano.evostackr.in/#features',
    searchIntent: 'COMMERCIAL',
    coverageScore: 86,
    parentTopicId: 'topic-pillar'
  },
  {
    id: 'subtopic-faq-technical',
    title: 'Online Piano Usage & Technical FAQ',
    type: 'SUPPORTING',
    url: 'https://my-piano.evostackr.in/#faq',
    searchIntent: 'INFORMATIONAL',
    coverageScore: 94,
    parentTopicId: 'topic-pillar'
  }
];
